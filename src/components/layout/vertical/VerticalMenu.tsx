'use client'

// MUI Imports

import { useQuery } from '@tanstack/react-query'

import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import { useSession, signOut } from 'next-auth/react'

import { GenerateVerticalMenu } from '@components/GenerateMenu'

import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Component Imports

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

// Hooks

const getMenus = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/base/menu', {
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    }
  })

  const { data, newToken, error } = await res.json()

  console.log(newToken)

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil Menu')
  }

  return data
}

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const session = useSession()

  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const { isPending, isError, error, data } = useQuery({
    queryKey: ['getMenus'],
    queryFn: () => getMenus(session?.data?.accessToken ?? '', session?.data?.refreshToken ?? ''),
    select: data => data,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false, // Mencegah refetch saat komponen dipasang kembali
    retry: false, // Pastikan tidak ada retry
    retryOnMount: false, // Mencegah retry otomatis saat komponen pertama kali dipasang
    enabled: !!session?.data?.accessToken

    //enabled: !!tokenAccess // Pastikan query hanya berjalan jika token tersedia
  })

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {isPending ? (
          <div className='p-4'>Loading...</div>
        ) : isError ? (
          <div>Error: {error?.message}</div>
        ) : (
          <GenerateVerticalMenu menuData={data.data.menu} />
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
