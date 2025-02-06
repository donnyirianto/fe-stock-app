// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { MenuDataType } from '@/types/settings/menuTypes'

// Component Imports
import MenuListTable from './ListTable'

//import UserListCards from './UserListCards'

const MenuList = ({ menuData }: { menuData?: MenuDataType[] }) => {
  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <UserListCards />
      </Grid> */}
      <Grid item xs={12}>
        <MenuListTable tableData={menuData} />
      </Grid>
    </Grid>
  )
}

export default MenuList
