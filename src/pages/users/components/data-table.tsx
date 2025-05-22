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
import { DataTableColumnHeader } from './data-table-column-header'
import { Checkbox } from '@radix-ui/react-checkbox'
import { DataTableRowActions } from './data-table-row-actions'
import DeleteDialog from './delete-user'
import { useNavigate } from 'react-router-dom'
import AddEditFarmer from './add-edit-user'
import { DataSchema } from '../data/schema'

//@ts-ignore
interface DataTableProps<TData, TValue> {
  columns: any
  data: TData[]
}

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
  const navigate = useNavigate();
  // Modal states for Add/Edit
  const [showModal, setShowModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [mode, setMode] = React.useState<'add' | 'edit'>('add')
  const [initialData, setInitialData] = React.useState<{ id: number, name: string } | null>(
    null
  )

  // Handle Add/Edit actions
  const handleAdd = () => {
    setMode('add')
    setInitialData(null)
    setShowModal(true)
  }

  const handleEdit = (rowData: { name: string, id: number }) => {
    setMode('edit')
    setInitialData(rowData)
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    setShowDeleteModal(false);
  }


  const handleDelete = (rowData: { name: string, id: number }) => {
    setInitialData(rowData)
    setShowDeleteModal(true)
  }



  const getColumns = React.useCallback((): ColumnDef<DataSchema>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
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
      accessorFn: row => `${row?.firstName}  ${row?.lastName ?? ''}`,
      id: 'fullName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span>{row.getValue('fullName')}</span>,
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
      cell: ({ row }) => <span>{row.getValue('email')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => <span>{row.getValue('isActive') ? 'Active' : 'Inactive'}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
      cell: ({ row }) => <span>{row.getValue('role')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Created At' />,
      cell: ({ row }) => <span>{row.getValue('createdAt')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions row={row} onEdit={handleEdit} onDelete={handleDelete} />
      ),
    }
  ],
    [handleEdit, handleDelete]
  );
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
        <AddEditFarmer
          mode={mode}
          //@ts-ignore
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
