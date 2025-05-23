import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from '../components/data-table-pagination'
import { DataTableToolbar } from '../components/data-table-toolbar'
import AddEditCropModal from './add-edit-crop'
import { DataTableColumnHeader } from './data-table-column-header'
import { Checkbox } from '@radix-ui/react-checkbox'
import { DataTableRowActions } from './data-table-row-actions'
import DeleteDialog from './delete-crop'
import { useEffect } from "react"
import { DataSchema } from '../data/schema'
//@ts-ignore
interface DataTableProps<TData, TValue> {
  columns: any
  data: TData[]
}
type CheckedState = boolean | "indeterminate";

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<DataSchema, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Modal states for Add/Edit
  const [showModal, setShowModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [mode, setMode] = React.useState<'add' | 'edit'>('add')
  const [initialData, setInitialData] = React.useState<{
    id: number, name: string, type: string, uom: number,
    packaging: string
  } | null>(
    null
  )

  // Handle Add/Edit actions
  const handleAdd = () => {
    setMode('add')
    setInitialData(null)
    setShowModal(true)
  }

  const handleEdit = (rowData: { name: string, id: number, type: string, uom: number, packaging: string }) => {
    setMode('edit')
    setInitialData(rowData)
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    setShowDeleteModal(false);
  }


  const handleDelete = (rowData: { name: string, id: number, type: string, uom: number, packaging: string }) => {
    setInitialData(rowData)
    setShowDeleteModal(true)
  }


  const getColumns = React.useCallback((): ColumnDef<DataSchema>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate') as CheckedState
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='SNO' />
      ),
      cell: ({ row, }) => <div className='w-[80px]'>{row.index + 1}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {row.getValue('name')}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorFn: row => row.type.name,
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {row.getValue('type')}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorFn: row => row.uom.name,
      accessorKey: 'uom',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Unit of measure' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {row.getValue('uom')}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'packaging',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Packaging' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {row.getValue('packaging')}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions row={row} onEdit={handleEdit} onDelete={handleDelete} />
      ),
    },
  ], [handleEdit, handleDelete])


  const table = useReactTable({
    data,
    columns: getColumns(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} handleAdd={handleAdd} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table?.getRowModel()?.rows?.length ? (
              table?.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                // onDoubleClick={() => handleEdit(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {showModal && (
        <AddEditCropModal
          mode={mode}
          initialData={initialData}
          handleCancel={handleCancel}
        />
      )}
      {showDeleteModal && (
        <DeleteDialog id={initialData?.id} name={initialData?.name} onClose={handleCancel}
        />
      )}
    </div>
  )
}
