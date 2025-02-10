'use client'

// Type Imports
import { useSession, signOut } from 'next-auth/react'

import { useQuery } from '@tanstack/react-query'

import MasterList from '@views/produk/master'

// Hooks

const getProdukMaster = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/produk/master', {
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
    queryKey: ['getProdukMaster'],
    queryFn: () => getProdukMaster(session?.data?.accessToken ?? '', session?.data?.refreshToken ?? ''),
    select: data => data.data.produk,
    staleTime: 0,
    refetchOnMount: true,
    retry: false,
    retryOnMount: true,
    enabled: !!session?.data?.accessToken
  })

  return <MasterList pending={isPending} isError={isError} error={error} masterData={data} />

  //return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default MasterListPage
