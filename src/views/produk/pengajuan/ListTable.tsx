'use client'

import { useEffect, useState } from 'react'

//import { useSession } from 'next-auth/react'

// React Imports

//import { useMutation, useQueryClient } from '@tanstack/react-query'

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

//import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

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

import type { PengajuanDataType } from '@/types/produk/pengajuanTypes'

// Component Imports
import AddPengajuanDrawer from './AddPengajuanDrawer'

//import EditPengajuanDrawer from './EditPengajuanDrawer'

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

type PengajuanDataTypeWithAction = PengajuanDataType & {
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
const columnHelper = createColumnHelper<PengajuanDataTypeWithAction>()

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

const PengajuanListTable = ({ tableData }: { tableData?: PengajuanDataType[] }) => {
  // States
  // const [open, setOpen] = useState(false)
  // const [selectedId, setSelectedId] = useState<string | null>(null)

  // Mutasi untuk menghapus pengajuan

  // const handleOpenDialog = (id: string) => {
  //   setSelectedId(id)
  //   setOpen(true)
  // }

  // const handleCloseDialog = () => {
  //   setOpen(false)
  //   setSelectedId(null)
  // }

  // const handleEdit = (id: string) => {
  //   setSelectedPengajuan(id)
  //   setEditDrawerOpen(true)
  // }

  const [globalFilter, setGlobalFilter] = useState('')
  const [addPengajuanOpen, setAddPengajuanOpen] = useState(false)

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: ({ row }) => <Typography>{row.original.id}</Typography>
    }),
    columnHelper.accessor('subject', {
      header: 'Subject',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.subject}</Typography>
    }),
    columnHelper.accessor('keterangan', {
      header: 'Keterangan',
      cell: ({ row }) => <Typography>{row.original.keterangan}</Typography>
    }),

    columnHelper.accessor('nama_user', {
      header: 'Diajukan Oleh',
      cell: ({ row }) => <Typography>{row.original.nama_user}</Typography>
    }),
    columnHelper.accessor('created_at', {
      header: 'Tanggal Buat',
      cell: ({ row }) => <Typography>{row.original.created_at}</Typography>
    }),
    columnHelper.accessor('updated_at', {
      header: 'Tanggal Update',
      cell: ({ row }) => <Typography>{row.original.updated_at}</Typography>
    }),

    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({}) => (
        <div className='flex gap-1'>
          <IconButton size='small'>
            <i className='ri-edit-box-line' />
          </IconButton>
        </div>
      )
    })
  ]

  const table = useReactTable({
    data: tableData as PengajuanDataType[],
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
        <CardHeader title='Data Pengajuan' className='pbe-4' />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-x-4 max-sm:gap-y-4 is-full flex-col sm:is-auto sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search'
              className='is-full sm:is-auto'
            />
            <Button
              variant='contained'
              onClick={() => setAddPengajuanOpen(!addPengajuanOpen)}
              className='is-full sm:is-auto'
            >
              Buat Pengajuan Baru
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

      {<AddPengajuanDrawer open={addPengajuanOpen} onClose={() => setAddPengajuanOpen(!addPengajuanOpen)} />}
      {/*<EditPengajuanDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        pengajuanId={selectedPengajuan}
      /> */}
      {/* Dialog Konfirmasi */}
    </>
  )
}

export default PengajuanListTable
