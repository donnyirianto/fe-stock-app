'use client'

import { useEffect } from 'react'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Drawer,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'

// Types
import type { UsersDataType } from '@/types/settings/usersTypes'

interface EditUsersDrawerProps {
  open: boolean
  onClose: () => void
  usersId: string | null
}

export default function EditUsersDrawer({ open, onClose, usersId }: EditUsersDrawerProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { register, handleSubmit, control, reset } = useForm<UsersDataType>({
    defaultValues: {
      nama: '',
      username: '',
      password: '',
      id_role: '',
      aktif: 'Y'
    }
  })

  // Query untuk mendapatkan detail users berdasarkan usersId
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['getSettingsUsersEdit', usersId],
    queryFn: async () => {
      if (!usersId) return null

      const res = await fetch(`/api/settings/users/${usersId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        }
      })

      if (!res.ok) throw new Error('Failed to fetch users data')
      const json = await res.json()

      return json.data.data.users
    },
    enabled: !!usersId && open
  })

  // Set data saat query selesai
  useEffect(() => {
    if (usersData) {
      reset({
        nama: usersData.nama || '',
        username: usersData.username || '',
        password: usersData.password || '',
        id_role: usersData.id_role?.toString() || '',
        aktif: usersData.aktif || 'Y'
      })
    }
  }, [usersData, reset])

  // Mutation untuk update users
  const updateUsersMutation = useMutation({
    mutationFn: async (data: UsersDataType) => {
      if (!usersId) throw new Error('Users ID is missing')

      const response = await fetch(`/api/settings/users/${usersId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update users')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getSettingsUsers'] })
      onClose()
      reset()
    }
  })

  const onSubmit = (data: UsersDataType) => {
    console.log('Data yang dikirim:', data) // Debugging
    updateUsersMutation.mutate(data)
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className='p-4 w-96'>
        <DialogTitle>Edit Users</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <TextField label='Nama' fullWidth margin='normal' {...register('nama', { required: true })} />
              <TextField label='Username' fullWidth margin='normal' {...register('username', { required: true })} />
              <TextField label='Password' type='password' fullWidth margin='normal' {...register('password')} />
              {/* Select Status Active */}
              <FormControl fullWidth margin='normal'>
                <InputLabel>Role</InputLabel>
                <Controller
                  name='id_role'
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value='1'>Owner</MenuItem>
                      <MenuItem value='2'>Admin</MenuItem>
                      <MenuItem value='3'>Sales</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>

              {/* Select Status Active */}
              <FormControl fullWidth margin='normal'>
                <InputLabel>Status</InputLabel>
                <Controller
                  name='aktif'
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value='Y'>Ya</MenuItem>
                      <MenuItem value='N'>Tidak</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='secondary'>
            Cancel
          </Button>
          <Button type='submit' variant='contained' color='primary' disabled={updateUsersMutation.isPending}>
            {updateUsersMutation.isPending ? 'Updating...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Drawer>
  )
}
