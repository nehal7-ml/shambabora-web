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
import AddEditHarvest from './add-edit-farmer-harvests'
import { DataTableColumnHeader } from './data-table-column-header'
import { Checkbox } from '@radix-ui/react-checkbox'
import { DataTableRowActions } from './data-table-row-actions'
import DeleteDialog from './delete-farmer'
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { DataSchema } from "../data/schema"
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
  const [initialData, setInitialData] = React.useState<DataSchema | null>(
    null
  )

  // Handle Add/Edit actionavins
  const handleAdd = () => {
    setInitialData(null)
    setMode('add')
    setShowModal(true)
  }

  const handleEdit = (rowData: DataSchema) => {
    setMode('edit')
    setInitialData(rowData)
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    setShowDeleteModal(false);
  }


  const handleDelete = (rowData: DataSchema) => {
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
      accessorFn: (row) => row.farmer?.email ?? "NA",
      accessorKey: 'farmer',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Farmer email' />,
      cell: ({ row }) => <span>{row.getValue('farmer')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'grossWeight',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Gross weight' />,
      cell: ({ row }) => <span>{row.getValue('grossWeight')}</span>,
      enableSorting: true,
      enableHiding: false,
    },

    {
      accessorKey: 'tumeNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tag Number' />,
      cell: ({ row }) => <span>{row.getValue('tumeNumber')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'receiptNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt Number' />,
      cell: ({ row }) => <span>{row.getValue('receiptNumber')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.crop.name,
      accessorKey: 'crop',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Crop Name' />,
      cell: ({ row }) => <span>{row.getValue('crop')}</span>,
      enableSorting: true,
      enableHiding: false,
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Received At' />,
      cell: ({ row }) => (
        <span>{format(new Date(row.getValue('createdAt')), 'dd MMM yyyy')}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions row={row} onEdit={handleEdit} onDelete={handleDelete} onView={() => {
          navigate(`/dashboard/harvest-details/${row.getValue('id')}`)
        }} />
      ),
    },
  ], [handleEdit, handleDelete]);

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
        <AddEditHarvest
          mode={mode}
          initialData={mode == 'add' ? null : initialData}
          handleCancel={handleCancel}
        />
      )}
      {showDeleteModal && (
        <DeleteDialog id={initialData?.id} name={initialData?.receiptNumber} onClose={handleCancel}
        />
      )}
    </div>
  )
}
