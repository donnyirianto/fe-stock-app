'use client'

import { useEffect } from 'react'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { DialogActions, DialogContent, DialogTitle, Button, TextField, Drawer } from '@mui/material'

// Types
import type { MasterDataType } from '@/types/produk/masterTypes'

interface EditMasterDrawerProps {
  open: boolean
  onClose: () => void
  masterId: string | null
}

export default function EditMasterDrawer({ open, onClose, masterId }: EditMasterDrawerProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset } = useForm<MasterDataType>({
    defaultValues: {
      nama: '',
      id_produk: '',
      merk: '',
      satuan: '',
      harga: '0'
    }
  })

  // Query untuk mendapatkan detail master berdasarkan masterId
  const { data: masterData, isLoading } = useQuery({
    queryKey: ['getProdukMasterEdit', masterId],
    queryFn: async () => {
      if (!masterId) return null

      const res = await fetch(`/api/produk/master/${masterId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        }
      })

      if (!res.ok) throw new Error('Failed to fetch master data')
      const json = await res.json()

      return json.data.data.master
    },
    enabled: !!masterId && open
  })

  // Set data saat query selesai
  useEffect(() => {
    if (masterData) {
      reset({
        nama: masterData.nama || '',
        id_produk: masterData.id_produk || '',
        merk: masterData.merk || '',
        satuan: masterData.satuan || '',
        harga: masterData.harga || '0'
      })
    }
  }, [masterData, reset])

  // Mutation untuk update master
  const updateMasterMutation = useMutation({
    mutationFn: async (data: MasterDataType) => {
      if (!masterId) throw new Error('ID Produk is missing')

      const response = await fetch(`/api/produk/master/${masterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update master')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProdukMaster'] })
      onClose()
      reset()
    }
  })

  const onSubmit = (data: MasterDataType) => {
    console.log('Data yang dikirim:', data) // Debugging
    updateMasterMutation.mutate(data)
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className='p-4 w-96'>
        <DialogTitle>Edit Master</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <TextField label='ID Produk' fullWidth margin='normal' {...register('id_produk', { required: true })} />
              <TextField label='Nama' fullWidth margin='normal' {...register('nama', { required: true })} />
              <TextField label='Merk' fullWidth margin='normal' {...register('merk', { required: true })} />
              <TextField label='Satuan' fullWidth margin='normal' {...register('satuan', { required: true })} />
              <TextField label='Harga' fullWidth margin='normal' {...register('harga', { required: true })} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='secondary'>
            Cancel
          </Button>
          <Button type='submit' variant='contained' color='primary' disabled={updateMasterMutation.isPending}>
            {updateMasterMutation.isPending ? 'Updating...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Drawer>
  )
}
