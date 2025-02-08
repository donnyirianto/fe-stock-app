'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

// React Imports

import { useMutation, useQueryClient } from '@tanstack/react-query'

// Next Imports
// import Link from 'next/link'
// import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

//import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'

//import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { MenuDataType } from '@/types/settings/menuTypes'

// Component Imports
import AddMenuDrawer from './AddMenuDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type MenuDataTypeWithAction = MenuDataType & {
  action?: string
}

type MenuStatusType = {
  [key: string]: ThemeColor
}

const menuStatusObj: MenuStatusType = {
  Y: 'success',
  N: 'secondary'
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper<MenuDataTypeWithAction>()

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const MenuListTable = ({ tableData }: { tableData?: MenuDataType[] }) => {
  const session = useSession()

  // States
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Mutasi untuk menghapus menu
  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.data?.accessToken ?? ''}`,
          'x-refresh-token': session?.data?.refreshToken ?? ''
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete menu item')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getSettingsMenu'] }) // Refresh data setelah delete
      handleCloseDialog()
    },
    onError: error => {
      console.error('Error deleting menu:', error)
    }
  })

  const handleOpenDialog = (id: string) => {
    setSelectedId(id)
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const [globalFilter, setGlobalFilter] = useState('')
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  const columns = [
    columnHelper.accessor('nama', {
      header: 'Nama',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.nama}</Typography>
    }),
    columnHelper.accessor('link', {
      header: 'Link',
      cell: ({ row }) => <Typography>{row.original.link}</Typography>
    }),
    columnHelper.accessor('active', {
      header: 'Status',
      cell: ({ row }) => (
        <Chip
          variant='tonal'
          label={row.original.active === 'Y' ? 'Enabled' : 'Disabled'}
          size='small'
          color={menuStatusObj[row.original.active as 'Y' | 'N']}
        />
      )
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex gap-1'>
          <IconButton size='small' onClick={() => row.original.id && handleOpenDialog(row.original.id)}>
            <i className='ri-delete-bin-7-line' />
          </IconButton>
          <IconButton size='small'>
            <i className='ri-edit-box-line' />
          </IconButton>
        </div>
      )
    })
  ]

  const table = useReactTable({
    data: tableData as MenuDataType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardHeader title='Data Menu' className='pbe-4' />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-x-4 max-sm:gap-y-4 is-full flex-col sm:is-auto sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Menu'
              className='is-full sm:is-auto'
            />
            <Button variant='contained' onClick={() => setAddMenuOpen(!addMenuOpen)} className='is-full sm:is-auto'>
              Add New Menu
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>
      <AddMenuDrawer open={addMenuOpen} handleClose={() => setAddMenuOpen(!addMenuOpen)} menuData={tableData} />
      {/* Dialog Konfirmasi */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus menu ini?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Batal
          </Button>
          <Button
            onClick={() => selectedId && deleteMenuMutation.mutate(selectedId)}
            color='error'
            disabled={deleteMenuMutation.isPending} // Disable saat loading
          >
            {deleteMenuMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MenuListTable
