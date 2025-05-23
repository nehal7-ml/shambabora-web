import { Cross2Icon, PlusCircledIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../components/data-table-view-options'
import { useNavigate } from 'react-router-dom'

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  handleAdd: () => void
}

export function DataTableToolbar<TData>({
  table,
  handleAdd
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const navigation = useNavigate()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <div className=' flex gap-1'>
          <Input
            placeholder='Filter Harvest...'
            value={(table.getColumn('farmer')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('farmer')?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />

          <Button
            variant='outline'
            size='sm'
            className='ml-auto hidden h-8 lg:flex'
            onClick={handleAdd}
          >
            <PlusCircledIcon className='mr-2 h-4 w-4' />
            Add Harvest
          </Button>
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />

    </div>
  )
}
