'use client'

// Type Imports
import { useSession, signOut } from 'next-auth/react'

import { useQuery } from '@tanstack/react-query'

import PengajuanList from '@views/produk/pengajuan'

// Hooks

const getProdukPengajuan = async (tokenAccess: string, tokenRefresh: string) => {
  if (!tokenAccess || !tokenRefresh) {
    await signOut({ redirect: true })
  }

  const res = await fetch('/api/produk/pengajuan', {
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      'x-refresh-token': tokenRefresh
    }
  })

  const { data, newToken, error } = await res.json()

  console.log(newToken)

  if (!res.ok) {
    throw new Error(error || 'Gagal mengambil Pengajuan')
  }

  return data
}

const PengajuanListPage = () => {
  const session = useSession()

  //
  const { isPending, isError, error, data } = useQuery({
    queryKey: ['getProdukPengajuan'],
    queryFn: () => getProdukPengajuan(session?.data?.accessToken ?? '', session?.data?.refreshToken ?? ''),
    select: data => data.data.pengajuan,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    retry: false,
    retryOnMount: false,
    enabled: !!session?.data?.accessToken
  })

  return <PengajuanList pending={isPending} isError={isError} error={error} pengajuanData={data} />

  //return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default PengajuanListPage
