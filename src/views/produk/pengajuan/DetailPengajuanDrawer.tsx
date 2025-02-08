import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material'
import { signOut, useSession } from 'next-auth/react'

interface DetailItem {
  id_produk: string
  nama: string
  harga: number
}

interface PengajuanDetail {
  id: string
  subject: string
  keterangan: string
  nama_user: string
  created_at: string
  updated_at: string
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

  console.log(newToken)

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil Data')
  }

  return data.data
}

const DetailPengajuanDialog: React.FC<DetailPengajuanDialogProps> = ({ open, onClose, pengajuanId }) => {
  const { data: session } = useSession()

  const { data, isLoading, error } = useQuery<PengajuanDetail>({
    queryKey: ['pengajuanDetail', pengajuanId],
    queryFn: () => fetchDetailPengajuan(pengajuanId!, session?.accessToken ?? '', session?.refreshToken ?? ''),
    enabled: !!pengajuanId && !!session?.accessToken
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Detail Pengajuan</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color='error'>Gagal memuat data.</Typography>
        ) : (
          <>
            <Typography variant='h6'>{data?.subject}</Typography>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {data?.keterangan}
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produk</TableCell>
                    <TableCell align='right'>Harga (Rp)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.detail_item.map(item => (
                    <TableRow key={item.id_produk}>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell align='right'>{item.harga.toLocaleString('id-ID')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='contained' color='secondary'>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DetailPengajuanDialog
