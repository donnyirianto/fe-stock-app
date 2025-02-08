import { useSession, signOut } from 'next-auth/react'
import { useForm, useFieldArray } from 'react-hook-form'
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
  CircularProgress
} from '@mui/material'

type Produk = {
  id_produk: string
  nama: string
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

  const { register, handleSubmit, control, reset } = useForm<FormData>({
    defaultValues: {
      subject: '',
      keterangan: '',
      detail_item: [{ id_produk: '', harga: '' }]
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

  const queryClient = useQueryClient()

  // Mutation untuk submit pengajuan
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
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
      queryClient.invalidateQueries({ queryKey: ['getProdukPengajuan'] })
      reset()
      onClose()
    },
    onError: error => {
      console.error('Gagal submit:', error)
      alert('Gagal melakukan pengajuan.')
    }
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Form Pengajuan Produk</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))}>
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
                <TextField
                  select
                  label='Produk'
                  fullWidth
                  {...register(`detail_item.${index}.id_produk`, { required: true })}
                >
                  {isLoadingProduk ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : produkList.length > 0 ? (
                    produkList.map(produk => (
                      <MenuItem key={produk.id_produk} value={produk.id_produk}>
                        {produk.nama}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Tidak ada produk tersedia</MenuItem>
                  )}
                </TextField>
              </Grid>

              {/* Harga */}
              <Grid item xs={4}>
                <TextField
                  label='Harga'
                  fullWidth
                  type='number'
                  {...register(`detail_item.${index}.harga`, { required: true })}
                />
              </Grid>

              {/* Remove Item */}
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
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
      </DialogContent>

      {/* Submit & Close Buttons */}
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Batal
        </Button>
        <Button onClick={handleSubmit(data => mutation.mutate(data))} variant='contained' disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PengajuanForm
