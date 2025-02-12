// React Imports
import { useState } from 'react'

import { useSession } from 'next-auth/react'

import { ToastContainer, toast } from 'react-toastify'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types Imports
import type { MasterDataType } from '@/types/produk/masterTypes'

type Props = {
  open: boolean
  handleClose: () => void
}

type FormValidateType = {
  nama: string
  merk: string
  id_produk: string
  satuan: string
  tipe: string
  harga: string
}

const AddMasterDrawer = (props: Props) => {
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
      merk: '',
      satuan: '',
      id_produk: '',
      harga: '',
      tipe: ''
    }
  })

  const handleFormSubmit = (data: MasterDataType) => {
    if (data.nama == '' || data.id_produk == '' || data.merk == '' || data.satuan == '' || data.tipe == '') {
      toast.warning('Pastikan form sudah terisi!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      })

      return
    }

    addMasterMutation.mutate(data)
  }

  const addMasterMutation = useMutation({
    mutationFn: async (newMaster: MasterDataType) => {
      const response = await fetch('/api/produk/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.data?.accessToken ?? ''}`,
          'x-refresh-token': session?.data?.refreshToken ?? ''
        },
        body: JSON.stringify(newMaster)
      })

      if (!response.ok) {
        throw new Error(`Failed to save master: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Data Produk berhasil ditambahkan!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      })

      // Invalidate query agar data master di-refresh setelah sukses tambah
      queryClient.invalidateQueries({ queryKey: ['getProdukMaster'] })

      // Reset form dan tutup drawer
      handleClose()
      resetForm()
    },
    onError: () => {
      toast.error('Data Produk Gagal ditambahkan!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      })
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
        <Typography variant='h5'>Add New Produk</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='id_produk'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='ID Produk'
                placeholder='ID Produk'
                error={Boolean(errors.id_produk)}
                helperText={errors.id_produk && 'This field is required.'}
              />
            )}
          />
          <Controller
            name='nama'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Nama Produk'
                placeholder='Nama Produk'
                error={Boolean(errors.nama)}
                helperText={errors.nama && 'This field is required.'}
              />
            )}
          />
          <Controller
            name='merk'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Merk'
                placeholder='Merk'
                error={Boolean(errors.merk)}
                helperText={errors.merk && 'This field is required.'}
              />
            )}
          />

          <Controller
            name='tipe'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Tipe'
                placeholder='Tipe'
                error={Boolean(errors.tipe)}
                helperText={errors.merk && 'This field is required.'}
              />
            )}
          />

          <Controller
            name='satuan'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Satuan'
                placeholder='Satuan'
                error={Boolean(errors.satuan)}
                helperText={errors.satuan && 'This field is required.'}
              />
            )}
          />

          <Controller
            name='harga'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Harga'
                placeholder='Harga'
                error={Boolean(errors.harga)}
                helperText={errors.harga && 'This field is required.'}
              />
            )}
          />

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={addMasterMutation.isPending}>
              {addMasterMutation.isPending ? 'Proses...' : 'Submit'}
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

      <ToastContainer />
    </Drawer>
  )
}

export default AddMasterDrawer
