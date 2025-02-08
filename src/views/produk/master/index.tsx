// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { MasterDataType } from '@/types/produk/masterTypes'

// Component Imports
import MasterListTable from './ListTable'

//import UserListCards from './UserListCards'

const MasterList = ({
  masterData,
  pending,
  isError,
  error
}: {
  masterData?: MasterDataType[]
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

      {/* Jika data kosong */}
      {!pending && !isError && masterData?.length === 0 && (
        <Grid item xs={12}>
          <Typography variant='h6' align='center'>
            Tidak ada master yang tersedia.
          </Typography>
        </Grid>
      )}

      {/* Jika data tersedia */}
      {!pending && !isError && masterData && masterData.length > 0 && (
        <Grid item xs={12}>
          <MasterListTable tableData={masterData} />
        </Grid>
      )}
    </Grid>
  )
}

export default MasterList
