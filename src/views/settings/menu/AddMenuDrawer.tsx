// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import type { MenuDataType } from '@/types/settings/menuTypes'

type Props = {
  open: boolean
  handleClose: () => void
  menuData?: MenuDataType[]
  setData: (data: MenuDataType[]) => void
}

type FormValidateType = {
  nama: string
  link: string
  urut: string
  active: string
}

type FormNonValidateType = {
  id_main: string
}

// Vars
const initialData = {
  id_main: ''
}

const AddMenuDrawer = (props: Props) => {
  // Props
  const { open, handleClose, menuData, setData } = props

  // States
  const [formData, setFormData] = useState<FormNonValidateType>(initialData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      nama: '',
      link: '',
      urut: '',
      active: ''
    }
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit = async (data: FormValidateType) => {
    try {
      const newMenu: MenuDataType = {
        nama: data.nama,
        link: data.link,
        urut: data.urut,
        active: data.active,
        id_main: formData.id_main
      }

      const response = await fetch('/api/settings/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMenu)
      })

      if (!response.ok) {
        throw new Error(`Failed to save menu: ${response.statusText}`)
      }

      await response.json() // Opsional: bisa digunakan jika ingin menampilkan hasil API

      // Update state hanya jika berhasil
      setData([...(menuData ?? []), newMenu])

      // Reset form
      handleClose()
      setFormData(initialData)
      resetForm({ nama: '', link: '', urut: '', active: '' })
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  const handleReset = () => {
    handleClose()
    setFormData(initialData)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Add New Menu</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
          <Controller
            name='nama'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Nama Menu'
                placeholder='Nama'
                {...(errors.nama && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='link'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Link'
                placeholder='Link Menu'
                {...(errors.link && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='urut'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='urut'
                label='Urutan Menu'
                placeholder=''
                {...(errors.urut && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <FormControl fullWidth>
            <InputLabel id='id_main'>Select ID Main Menu</InputLabel>
            <Select
              fullWidth
              id='id_main'
              value={formData.id_main}
              onChange={e => setFormData({ ...formData, id_main: e.target.value })}
              label='Select ID Main Menu'
              labelId='id_main'
            >
              {menuData?.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {option.nama}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id='active' error={Boolean(errors.active)}>
              Aktif?
            </InputLabel>
            <Controller
              name='active'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label='Aktif ?' {...field} error={Boolean(errors.active)}>
                  <MenuItem value='Y'>Ya</MenuItem>
                  <MenuItem value='N'>Tidak</MenuItem>
                </Select>
              )}
            />
            {errors.active && <FormHelperText error>This field is required.</FormHelperText>}
          </FormControl>

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              Submit
            </Button>
            <Button variant='outlined' color='error' type='reset' onClick={() => handleReset()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
      {/* Dialog Error */}
      <Dialog open={Boolean(errorMessage)} onClose={() => setErrorMessage(null)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{errorMessage}</DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorMessage(null)} color='primary'>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  )
}

export default AddMenuDrawer
