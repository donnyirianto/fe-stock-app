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

import type { MasterDataType } from '@/types/produk/masterTypes'

// Component Imports
import AddMasterDrawer from './AddMasterDrawer'
import EditMasterDrawer from './EditMasterDrawer'

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

type MasterDataTypeWithAction = MasterDataType & {
  action?: string
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
const columnHelper = createColumnHelper<MasterDataTypeWithAction>()

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

const MasterListTable = ({ tableData }: { tableData?: MasterDataType[] }) => {
  const session = useSession()

  // States
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Mutasi untuk menghapus master
  const deleteMasterMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/produk/master/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.data?.accessToken ?? ''}`,
          'x-refresh-token': session?.data?.refreshToken ?? ''
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete master item')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProdukMaster'] }) // Refresh data setelah delete
      handleCloseDialog()
    },
    onError: error => {
      console.error('Error deleting master:', error)
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

  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    setSelectedMaster(id)
    setEditDrawerOpen(true)
  }

  const [globalFilter, setGlobalFilter] = useState('')
  const [addMasterOpen, setAddMasterOpen] = useState(false)

  const columns = [
    columnHelper.accessor('id_produk', {
      header: 'ID',
      cell: ({ row }) => <Typography>{row.original.id_produk}</Typography>
    }),
    columnHelper.accessor('nama', {
      header: 'Nama',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.nama}</Typography>
    }),
    columnHelper.accessor('merk', {
      header: 'Merk',
      cell: ({ row }) => <Typography>{row.original.merk}</Typography>
    }),

    columnHelper.accessor('satuan', {
      header: 'Satuan',
      cell: ({ row }) => <Typography>{row.original.satuan}</Typography>
    }),
    columnHelper.accessor('harga', {
      header: 'Harga',
      cell: ({ row }) => <Typography>{row.original.harga}</Typography>
    }),

    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex gap-1'>
          <IconButton size='small' onClick={() => row.original.id_produk && handleOpenDialog(row.original.id_produk)}>
            <i className='ri-delete-bin-7-line' />
          </IconButton>
          <IconButton size='small' onClick={() => row.original.id_produk && handleEdit(row.original.id_produk)}>
            <i className='ri-edit-box-line' />
          </IconButton>
        </div>
      )
    })
  ]

  const table = useReactTable({
    data: tableData as MasterDataType[],
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
        <CardHeader title='Data Produk' className='pbe-4' />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-x-4 max-sm:gap-y-4 is-full flex-col sm:is-auto sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Produk'
              className='is-full sm:is-auto'
            />
            <Button variant='contained' onClick={() => setAddMasterOpen(!addMasterOpen)} className='is-full sm:is-auto'>
              Add New Produk
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
      <AddMasterDrawer open={addMasterOpen} handleClose={() => setAddMasterOpen(!addMasterOpen)} />
      <EditMasterDrawer open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)} masterId={selectedMaster} />
      {/* Dialog Konfirmasi */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus produk ini?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Batal
          </Button>
          <Button
            onClick={() => selectedId && deleteMasterMutation.mutate(selectedId)}
            color='error'
            disabled={deleteMasterMutation.isPending} // Disable saat loading
          >
            {deleteMasterMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MasterListTable
