import { useSession, signOut } from 'next-auth/react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

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

type Produk = {
  id_produk: string
  nama: string
  harga: string
}

type DetailItem = {
  id_produk: string
  harga: string
}

type FormData = {
  subject: string
  keterangan: string
  detail_item: DetailItem[]
}

interface PengajuanFormProps {
  open: boolean
  onClose: () => void
}

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

const PengajuanForm: React.FC<PengajuanFormProps> = ({ open, onClose }) => {
  const { data: session } = useSession()

  const { register, handleSubmit, control, reset, setValue } = useForm<FormData>({
    defaultValues: {
      subject: '',
      keterangan: '',
      detail_item: [{ id_produk: '', harga: '0' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detail_item'
  })

  // Fetch data produk dari API
  const { data: produkList = [], isLoading: isLoadingProduk } = useQuery<Produk[]>({
    queryKey: ['PengajuanProdukList'],
    queryFn: () => getProdukMaster(session?.accessToken ?? '', session?.refreshToken ?? ''),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    retry: false,
    retryOnMount: false,
    enabled: !!session?.accessToken
  })

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

  const queryClient = useQueryClient()

  // Mutation untuk submit pengajuan
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      toast.info('Proses simpan data penawaran!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      })

      const response = await fetch(`/api/produk/pengajuan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update master')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Data penawaran berhasil dibuat!', {
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
      reset()
      onClose()
    },
    onError: () => {
      toast.error('Data penawaran Gagal dibuat!', {
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
      <DialogTitle>Form Penawaran</DialogTitle>
      <DialogContent dividers>
        {isLoadingProduk ? (
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

            {/* Dynamic Form for Items */}
            <Typography variant='h6' sx={{ mt: 2 }}>
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
                            const selectedProduct = produkList?.find((p: any) => p.id_produk === selectedId)

                            if (selectedProduct) {
                              setValue(`detail_item.${index}.harga`, selectedProduct.harga)
                            }
                          }}
                        >
                          <MenuItem value=''>Pilih Produk</MenuItem>
                          {isLoadingProduk ? (
                            <MenuItem disabled>Loading...</MenuItem>
                          ) : (
                            produkList?.map((produk: any) => (
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

            {/* Add Item Button */}
            <Button variant='outlined' sx={{ mt: 2 }} onClick={() => append({ id_produk: '', harga: '' })}>
              + Add Item
            </Button>
          </form>
        )}
      </DialogContent>

      {/* Submit & Close Buttons */}
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Batal
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant='contained' disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
      <ToastContainer />
    </Dialog>
  )
}

export default PengajuanForm
