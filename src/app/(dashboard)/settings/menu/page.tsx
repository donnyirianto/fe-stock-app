'use client'

// Type Imports
import { useSession, signOut } from 'next-auth/react'

import { useQuery } from '@tanstack/react-query'

import MenuList from '@views/settings/menu'

// Hooks

const getSettingsMenu = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/settings/menu', {
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

const MenuListPage = () => {
  const session = useSession()

  //
  const { isPending, isError, error, data } = useQuery({
    queryKey: ['getSettingsMenu'],
    queryFn: () => getSettingsMenu(session?.data?.accessToken ?? '', session?.data?.refreshToken ?? ''),
    select: data => data.data.menu,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    retry: false,
    retryOnMount: false,
    enabled: !!session?.data?.accessToken
  })

  return <MenuList pending={isPending} isError={isError} error={error} menuData={data} />

  //return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default MenuListPage
