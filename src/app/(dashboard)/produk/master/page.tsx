'use client'

// Type Imports
import { useSession, signOut } from 'next-auth/react'

import { useQuery } from '@tanstack/react-query'

import MasterList from '@views/produk/master'

// Hooks

const getSettingsMaster = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/settings/master', {
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    }
  })

  const { data, newToken, error } = await res.json()

  console.log(newToken)

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil Master')
  }

  return data
}

const MasterListPage = () => {
  const session = useSession()

  //
  const { isPending, isError, error, data } = useQuery({
    queryKey: ['getSettingsMaster'],
    queryFn: () => getSettingsMaster(session?.data?.accessToken ?? '', session?.data?.refreshToken ?? ''),
    select: data => data.data.master,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    retry: false,
    retryOnMount: false,
    enabled: !!session?.data?.accessToken
  })

  return <MasterList pending={isPending} isError={isError} error={error} masterData={data} />

  //return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default MasterListPage
