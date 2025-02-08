// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { UsersDataType } from '@/types/settings/usersTypes'

// Component Imports
import UsersListTable from './ListTable'

//import UserListCards from './UserListCards'

const UsersList = ({
  usersData,
  pending,
  isError,
  error
}: {
  usersData?: UsersDataType[]
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
      {!pending && !isError && usersData?.length === 0 && (
        <Grid item xs={12}>
          <Typography variant='h6' align='center'>
            Tidak ada users yang tersedia.
          </Typography>
        </Grid>
      )}

      {/* Jika data tersedia */}
      {!pending && !isError && usersData && usersData.length > 0 && (
        <Grid item xs={12}>
          <UsersListTable tableData={usersData} />
        </Grid>
      )}
    </Grid>
  )
}

export default UsersList
