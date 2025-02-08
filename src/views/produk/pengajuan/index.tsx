// MUI Imports
import Grid from '@mui/material/Grid'

//import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { PengajuanDataType } from '@/types/produk/pengajuanTypes'

// Component Imports
import PengajuanListTable from './ListTable'

//import UserListCards from './UserListCards'

const PengajuanList = ({
  pengajuanData,
  pending,
  isError,
  error
}: {
  pengajuanData?: PengajuanDataType[]
  pending: boolean
  isError: boolean
  error: any
}) => {
  return (
    <Grid container spacing={6}>
      {/* Jika sedang loading */}
      {pending && (
        <Grid item xs={12} display='flex' justifyContent='center'>
          <CircularProgress />
        </Grid>
      )}

      {/* Jika terjadi error */}
      {isError && (
        <Grid item xs={12}>
          <Alert severity='error'>Error: {error?.message || 'Terjadi kesalahan'}</Alert>
        </Grid>
      )}

      {/* Jika data tersedia */}
      {!pending && !isError && pengajuanData && (
        <Grid item xs={12}>
          <PengajuanListTable tableData={pengajuanData} />
        </Grid>
      )}
    </Grid>
  )
}

export default PengajuanList
