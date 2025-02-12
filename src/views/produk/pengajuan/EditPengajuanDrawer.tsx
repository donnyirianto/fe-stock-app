'use client'

import { useEffect } from 'react'

import { ToastContainer, toast } from 'react-toastify'

import { useSession, signOut } from 'next-auth/react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  CircularProgress,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'

type DetailItem = {
  id_produk: string
  harga: string
}

type FormData = {
  subject: string
  keterangan: string
  detail_item: DetailItem[]
}

interface EditPengajuanProps {
  open: boolean
  onClose: () => void
  pengajuanId: string | null
}

// Fetch daftar produk dari API
const getProdukMaster = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/produk/master', {
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    }
  })

  const { data, newToken, error } = await res.json()

  console.log(newToken)

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil Master')
  }

  return data.data.produk
}

// Fetch data pengajuan berdasarkan ID
const fetchPengajuanById = async (id: string, tokenAccess: string, tokenRefresh: string) => {
  if (!id) return null

  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch(`/api/produk/pengajuan/${id}`, {
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    }
  })

  const { data, newToken, error } = await res.json()

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil data pengajuan')
  }

  console.log(newToken)

  return data.data
}

const EditPengajuanForm: React.FC<EditPengajuanProps> = ({ open, onClose, pengajuanId }) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { register, handleSubmit, control, reset, setValue } = useForm<FormData>({
    defaultValues: {
      subject: '',
      keterangan: '',
      detail_item: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detail_item'
  })

  // Fetch daftar produk
  const { data: productList, isLoading: isLoadingProduk } = useQuery({
    queryKey: ['getProdukMaster'],
    queryFn: () => getProdukMaster(session?.accessToken ?? '', session?.refreshToken ?? ''),
    staleTime: 1000 * 60 * 10
  })

  // Fetch data pengajuan dari API berdasarkan ID
  const { isLoading, data: pengajuanData } = useQuery({
    queryKey: ['pengajuan', pengajuanId],
    queryFn: () => fetchPengajuanById(pengajuanId ?? '', session?.accessToken ?? '', session?.refreshToken ?? ''),
    enabled: !!pengajuanId,
    staleTime: 0
  })

  // Isi form saat data pengajuan tersedia
  useEffect(() => {
    if (pengajuanData) {
      reset({
        subject: pengajuanData.pengajuan.subject,
        keterangan: pengajuanData.pengajuan.keterangan,
        detail_item: pengajuanData.detail_item.map((item: any) => ({
          id_produk: item.id_produk,
          harga: item.harga.toString()
        }))
      })
    }
  }, [pengajuanData, reset])

  const handleFormSubmit = (data: FormData) => {
    if (data.detail_item.length === 0 || data.detail_item.some(item => !item.id_produk || !item.harga)) {
      toast.warning('Pastikan item produk sudah terisi!', {
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

    mutation.mutate(data)
  }

  // Mutation untuk update pengajuan
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/produk/pengajuan/${pengajuanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Gagal mengupdate pengajuan')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Data penawaran berhasil diupdate!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      })
      queryClient.invalidateQueries({ queryKey: ['getProdukPengajuan'] })
      onClose()
    },
    onError: () => {
      toast.error('Data penawaran Gagal diupdate!', {
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Edit Penawaran</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Subject */}
            <TextField label='Subject' fullWidth margin='normal' {...register('subject', { required: true })} />

            {/* Keterangan */}
            <TextField
              label='Keterangan'
              fullWidth
              margin='normal'
              multiline
              rows={3}
              {...register('keterangan', { required: true })}
            />

            {/* Detail Item */}
            <Typography variant='h6' sx={{ mt: 2, mb: 2 }}>
              Detail Item
            </Typography>

            {fields.map((item, index) => (
              <Grid container spacing={2} key={item.id} sx={{ mb: 2 }}>
                {/* Produk */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Produk</InputLabel>
                    <Controller
                      name={`detail_item.${index}.id_produk`}
                      control={control}
                      defaultValue={item.id_produk}
                      render={({ field }) => (
                        <Select
                          {...field}
                          value={field.value || ''}
                          onChange={event => {
                            const selectedId = event.target.value

                            field.onChange(selectedId)

                            // Cari produk yang sesuai dengan ID yang dipilih
                            const selectedProduct = productList?.find((p: any) => p.id_produk === selectedId)

                            if (selectedProduct) {
                              setValue(`detail_item.${index}.harga`, selectedProduct.harga)
                            }
                          }}
                        >
                          <MenuItem value=''>Pilih Produk</MenuItem>
                          {isLoadingProduk ? (
                            <MenuItem disabled>Loading...</MenuItem>
                          ) : (
                            productList?.map((produk: any) => (
                              <MenuItem key={produk.id_produk} value={produk.id_produk}>
                                {produk.nama}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Harga */}
                <Grid item xs={4}>
                  <TextField
                    label='Harga'
                    fullWidth
                    type='number'
                    defaultValue={item.harga}
                    {...register(`detail_item.${index}.harga`, { required: true })}
                  />
                </Grid>

                {/* Hapus Item */}
                <Grid item xs={2}>
                  <Button variant='contained' color='error' onClick={() => remove(index)}>
                    X
                  </Button>
                </Grid>
              </Grid>
            ))}

            {/* Tambah Item */}
            <Button variant='outlined' sx={{ mt: 2 }} onClick={() => append({ id_produk: '', harga: '0' })}>
              + Add Item
            </Button>
          </form>
        )}
      </DialogContent>

      {/* Submit & Close Buttons */}
      <DialogActions>
        <Button
          onClick={() => {
            reset({
              subject: pengajuanData?.pengajuan.subject || '',
              keterangan: pengajuanData?.pengajuan.keterangan || '',
              detail_item:
                pengajuanData?.detail_item.map((item: any) => ({
                  id_produk: item.id_produk,
                  harga: item.harga.toString()
                })) || []
            })
            onClose()
          }}
          color='secondary'
        >
          Batal
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant='contained' disabled={mutation.isPending}>
          {mutation.isPending ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
      <ToastContainer />
    </Dialog>
  )
}

export default EditPengajuanForm
