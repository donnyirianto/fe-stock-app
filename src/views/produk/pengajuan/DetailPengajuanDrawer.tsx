import { useEffect } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Typography,
  CircularProgress

  //Card,
  //CardContent
} from '@mui/material'
import { signOut, useSession } from 'next-auth/react'

import tableStyles from '@core/styles/table.module.css'

interface DetailItem {
  id_produk: string
  nama: string
  merk: string
  tipe: string
  satuan: string
  harga: number
}
interface PengajuanRekap {
  id: string
  subject: string
  keterangan: string
  nama_user: string
  jumlah_item: string
  status: string
  created_at: string
  updated_at: string
}
interface PengajuanDetail {
  pengajuan: PengajuanRekap
  detail_item: DetailItem[]
}

interface DetailPengajuanDialogProps {
  open: boolean
  onClose: () => void
  pengajuanId: string | null
}

const fetchDetailPengajuan = async (id: string, tokenAccess: string, tokenRefresh: string) => {
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
    throw new Error(error || 'Gagal mengambil Data')
  }

  console.log(newToken)

  return data.data
}

// Fungsi untuk mengirim approval/reject ke backend
const updatePengajuanStatus = async ({
  id,
  status,
  tokenAccess,
  tokenRefresh
}: {
  id: string
  status: string
  tokenAccess: string
  tokenRefresh: string
}) => {
  const res = await fetch(`/api/produk/pengajuan/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    },
    body: JSON.stringify({ status })
  })

  const { data, error } = await res.json()

  if (!res.ok) {
    throw new Error(error || 'Gagal memperbarui status')
  }

  return data
}

const DetailPengajuanDialog: React.FC<DetailPengajuanDialogProps> = ({ open, onClose, pengajuanId }) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery<PengajuanDetail>({
    queryKey: ['pengajuanDetail', pengajuanId],
    queryFn: () => fetchDetailPengajuan(pengajuanId!, session?.accessToken ?? '', session?.refreshToken ?? ''),
    enabled: !!pengajuanId && !!session?.accessToken,
    staleTime: 0
  })

  // Refetch data setiap kali dialog dibuka
  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  // Mutation untuk approval atau reject
  const mutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      updatePengajuanStatus({
        id: pengajuanId!,
        status,
        tokenAccess: session?.accessToken ?? '',
        tokenRefresh: session?.refreshToken ?? ''
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengajuanDetail', pengajuanId] }) // Refresh detail pengajuan
      queryClient.invalidateQueries({ queryKey: ['getProdukPengajuan'] }) // Refresh daftar pengajuan
      onClose() // Tutup dialog setelah sukses
    },
    onError: error => {
      alert(`Gagal memperbarui status: ${error}`)
    }
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color='error'>Gagal memuat data.</Typography>
        ) : (
          <>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <div className='p-6 bg-actionHover rounded'>
                  <div className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                    <div className='flex flex-col gap-6'>
                      <div className='flex items-center gap-2.5'>
                        <Typography variant='h4'>Penawaran</Typography>
                      </div>
                    </div>
                    <div className='flex flex-col gap-6'>
                      <Typography variant='h5'>{`#${data?.pengajuan?.id}`}</Typography>
                      <div className='flex flex-col gap-1'>
                        <Typography color='text.primary'>{`Tanggal Buat: ${data?.pengajuan?.created_at}`}</Typography>
                        <Typography color='text.primary'>{`Tanggal Update: ${data?.pengajuan?.updated_at}`}</Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>

              <Grid item xs={12}>
                <div className='overflow-x-auto border rounded'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr className='border-be'>
                        <th className='!bg-transparent'>ID</th>
                        <th className='!bg-transparent'>Nama Produk</th>
                        <th className='!bg-transparent'>Merk</th>
                        <th className='!bg-transparent'>Tipe</th>
                        <th className='!bg-transparent'>Satuan</th>
                        <th className='!bg-transparent'>Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.detail_item.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Typography color='text.primary'>{item.id_produk}</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{item.nama}</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{item.merk}</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{item.tipe}</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{item.satuan}</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{item.harga.toLocaleString('id-US')}</Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className='flex justify-between flex-col gap-y-4 sm:flex-row'>
                  <div className='flex flex-col gap-1 order-2 sm:order-[unset]'>
                    <div className='flex items-center gap-2'>
                      <Typography className='font-medium' color='text.primary'>
                        Sales:
                      </Typography>
                      <Typography>{data?.pengajuan?.nama_user}</Typography>
                    </div>
                    <Typography>Terima kasih</Typography>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Divider className='border-dashed' />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {/* Tombol hanya tampil jika user.role === 1 */}
        {session?.user?.role === '1' && (
          <>
            <Button
              onClick={() => mutation.mutate({ status: 'approved' })}
              variant='contained'
              color='primary'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Memproses...' : 'Approval'}
            </Button>
            <Button
              onClick={() => mutation.mutate({ status: 'rejected' })}
              variant='contained'
              color='error'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Memproses...' : 'Reject'}
            </Button>
          </>
        )}
        <Button onClick={onClose} variant='contained' color='secondary'>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DetailPengajuanDialog
