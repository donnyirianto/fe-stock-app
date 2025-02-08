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
import type { MenuDataType } from '@/types/settings/menuTypes'

interface EditMenuDrawerProps {
  open: boolean
  onClose: () => void
  menuId: string | null
  menuList?: MenuDataType[]
}

export default function EditMenuDrawer({ open, onClose, menuId, menuList = [] }: EditMenuDrawerProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { register, handleSubmit, control, reset } = useForm<MenuDataType>({
    defaultValues: {
      nama: '',
      link: '',
      urut: '0',
      id_main: '',
      active: 'Y'
    }
  })

  // Query untuk mendapatkan detail menu berdasarkan menuId
  const { data: menuData, isLoading } = useQuery({
    queryKey: ['getSettingsMenuEdit', menuId],
    queryFn: async () => {
      if (!menuId) return null

      const res = await fetch(`/api/settings/menu/${menuId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        }
      })

      if (!res.ok) throw new Error('Failed to fetch menu data')
      const json = await res.json()

      return json.data.data.menu
    },
    enabled: !!menuId && open
  })

  // Set data saat query selesai
  useEffect(() => {
    if (menuData) {
      reset({
        nama: menuData.nama || '',
        link: menuData.link || '',
        urut: menuData.urut?.toString() || '0',
        id_main: menuData.id_main?.toString() || '',
        active: menuData.active || 'Y'
      })
    }
  }, [menuData, reset])

  // Mutation untuk update menu
  const updateMenuMutation = useMutation({
    mutationFn: async (data: MenuDataType) => {
      if (!menuId) throw new Error('Menu ID is missing')

      const response = await fetch(`/api/settings/menu/${menuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken ?? ''}`,
          'x-refresh-token': session?.refreshToken ?? ''
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update menu')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getSettingsMenu'] })
      onClose()
      reset()
    }
  })

  const onSubmit = (data: MenuDataType) => {
    console.log('Data yang dikirim:', data) // Debugging
    updateMenuMutation.mutate(data)
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className='p-4 w-96'>
        <DialogTitle>Edit Menu</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <TextField label='Nama' fullWidth margin='normal' {...register('nama', { required: true })} />
              <TextField label='Link' fullWidth margin='normal' {...register('link')} />
              <TextField label='Urut' fullWidth margin='normal' type='number' {...register('urut')} />

              {/* Select ID Main Menu */}
              <FormControl fullWidth margin='normal'>
                <InputLabel>ID Main Menu</InputLabel>
                <Controller
                  name='id_main'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} defaultValue=''>
                      <MenuItem value=''>None</MenuItem>
                      {menuList?.map(menu => (
                        <MenuItem key={menu.id} value={menu.id?.toString()}>
                          {menu.nama}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              {/* Select Status Active */}
              <FormControl fullWidth margin='normal'>
                <InputLabel>Status</InputLabel>
                <Controller
                  name='active'
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value='Y'>Active</MenuItem>
                      <MenuItem value='N'>Inactive</MenuItem>
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
          <Button type='submit' variant='contained' color='primary' disabled={updateMenuMutation.isPending}>
            {updateMenuMutation.isPending ? 'Updating...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Drawer>
  )
}
