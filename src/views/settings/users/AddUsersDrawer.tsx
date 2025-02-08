// React Imports
import { useState } from 'react'

import { useSession } from 'next-auth/react'

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
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types Imports
import type { UsersDataType } from '@/types/settings/usersTypes'

type Props = {
  open: boolean
  handleClose: () => void
}

type FormValidateType = {
  nama: string
  username: string
  id_role: string
  password: string
  aktif: string
}

const AddUsersDrawer = (props: Props) => {
  const session = useSession()
  const { open, handleClose } = props
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      nama: '',
      username: '',
      password: '',
      id_role: '',
      aktif: ''
    }
  })

  const addUsersMutation = useMutation({
    mutationFn: async (newUsers: UsersDataType) => {
      const response = await fetch('/api/settings/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.data?.accessToken ?? ''}`,
          'x-refresh-token': session?.data?.refreshToken ?? ''
        },
        body: JSON.stringify(newUsers)
      })

      if (!response.ok) {
        throw new Error(`Failed to save users: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate query agar data users di-refresh setelah sukses tambah
      queryClient.invalidateQueries({ queryKey: ['getSettingsUsers'] })

      // Reset form dan tutup drawer
      handleClose()
      resetForm()
    },
    onError: (error: any) => {
      setErrorMessage(error.message)
    }
  })

  const handleReset = () => {
    handleClose()
    resetForm()
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
        <Typography variant='h5'>Add New Users</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(data => addUsersMutation.mutate(data))} className='flex flex-col gap-5'>
          <Controller
            name='nama'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Nama Users'
                placeholder='Nama'
                error={Boolean(errors.nama)}
                helperText={errors.nama && 'This field is required.'}
              />
            )}
          />
          <Controller
            name='username'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Username'
                placeholder='Username'
                error={Boolean(errors.username)}
                helperText={errors.username && 'This field is required.'}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='password'
                label='Password'
                placeholder='Password'
                error={Boolean(errors.password)}
                helperText={errors.password && 'This field is required.'}
              />
            )}
          />

          <FormControl fullWidth error={Boolean(errors.id_role)}>
            <InputLabel id='id_role'>Role</InputLabel>
            <Controller
              name='id_role'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} label='Role'>
                  <MenuItem value='1'>Owner</MenuItem>
                  <MenuItem value='2'>Admin</MenuItem>
                  <MenuItem value='3'>Sales</MenuItem>
                </Select>
              )}
            />
            {errors.id_role && <FormHelperText>This field is required.</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={Boolean(errors.aktif)}>
            <InputLabel id='active'>Aktif?</InputLabel>
            <Controller
              name='aktif'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} label='Aktif?'>
                  <MenuItem value='Y'>Ya</MenuItem>
                  <MenuItem value='N'>Tidak</MenuItem>
                </Select>
              )}
            />
            {errors.aktif && <FormHelperText>This field is required.</FormHelperText>}
          </FormControl>

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={addUsersMutation.isPending}>
              {addUsersMutation.isPending ? 'Proses...' : 'Submit'}
            </Button>
            <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
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

export default AddUsersDrawer
