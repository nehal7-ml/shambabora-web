import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/custom/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { schema } from '../data/schema'
import { useMemo } from "react"


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onView: (rowData: any) => void
  onEdit: (rowData: any) => void
  onDelete: (rowData: any) => void
}

export function DataTableRowActions<TData>({
  row,
  onDelete,
  onEdit,
  onView
}: DataTableRowActionsProps<TData>) {

  const item = useMemo(()=>schema.parse(row.original), [row.original]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={() => onView(item)}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(item)}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
