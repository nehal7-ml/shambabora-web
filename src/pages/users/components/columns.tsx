import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { DataSchema } from '../data/schema'
import { format } from 'date-fns'

interface DataTableColumnsProps {
  handleEdit: (rowData: any) => void
  handleDelete: (rowData: any) => void
  handleView?: (rowData: any) => void
}

export const columns = <TData extends DataSchema>({
  handleEdit,
  handleDelete,
  handleView,
}: DataTableColumnsProps): ColumnDef<TData>[] => [
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
      cell: ({ row }) => <div className='w-[80px]'>{row.index + 1}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row: any) =>
        [row?.firstName, row?.middleName, row?.lastName].filter(Boolean).join(' '),
      id: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => <span>{row.getValue('fullName')}</span>,
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => <span>{row.getValue('email')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Phone Number' />
      ),
      cell: ({ row }) => <span>{row.getValue('phoneNumber')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <span>{row.getValue('isActive') ? 'Active' : 'Inactive'}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Role' />
      ),
      cell: ({ row }) => <span>{row.getValue('role')}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created At' />
      ),
      cell: ({ row }) => (
        <span>{format(new Date(row.getValue('createdAt')), 'dd MMM yyyy')}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
  ]
