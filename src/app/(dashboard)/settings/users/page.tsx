'use client'

// Type Imports
import { useSession, signOut } from 'next-auth/react'

import { useQuery } from '@tanstack/react-query'

import UsersList from '@views/settings/users'

// Hooks

const getSettingsUsers = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/settings/users', {
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    }
  })

  const { data, newToken, error } = await res.json()

  console.log(newToken)

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil Users')
  }

  return data
}

const UsersListPage = () => {
  const session = useSession()

  //
  const { isPending, isError, error, data } = useQuery({
    queryKey: ['getSettingsUsers'],
    queryFn: () => getSettingsUsers(session?.data?.accessToken ?? '', session?.data?.refreshToken ?? ''),
    select: data => data.data.users,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    retry: false,
    retryOnMount: false,
    enabled: !!session?.data?.accessToken
  })

  return <UsersList pending={isPending} isError={isError} error={error} usersData={data} />

  //return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default UsersListPage
