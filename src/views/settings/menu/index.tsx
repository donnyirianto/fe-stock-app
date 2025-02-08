// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { MenuDataType } from '@/types/settings/menuTypes'

// Component Imports
import MenuListTable from './ListTable'

//import UserListCards from './UserListCards'

const MenuList = ({
  menuData,
  pending,
  isError,
  error
}: {
  menuData?: MenuDataType[]
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
      {!pending && !isError && menuData?.length === 0 && (
        <Grid item xs={12}>
          <Typography variant='h6' align='center'>
            Tidak ada menu yang tersedia.
          </Typography>
        </Grid>
      )}

      {/* Jika data tersedia */}
      {!pending && !isError && menuData && menuData.length > 0 && (
        <Grid item xs={12}>
          <MenuListTable tableData={menuData} />
        </Grid>
      )}
    </Grid>
  )
}

export default MenuList
