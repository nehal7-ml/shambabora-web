import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppDispatch } from '@/hooks/store-hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { getRegions, postMCU, updateMCU } from '@/helpers/api-helper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAlert } from '@/store/slices/elert-slice'
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Please enter Mcu name' }),
  region: z.string().min(1, { message: 'Please select region' })
})

type FormSchema = z.infer<typeof formSchema>

interface AddEditMcuProps {
  mode: 'add' | 'edit'
  initialData?: { name: string; id: number; region: any } | null
  handleCancel: () => void
}

const AddEditMcu = ({
  mode,
  initialData,
  handleCancel,
}: AddEditMcuProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      region: initialData?.region?.toString() || '',
    },
  })

  console.log(initialData);

  const { data: regions, isLoading: isRegionsLoading, } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response: any = await getRegions()
      return response.data
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      if (mode === 'edit' && initialData?.id) {
        return await updateMCU(initialData.id, data)
      } else {
        return await postMCU(data)
      }
    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message: mode === 'edit' ? 'Mcu updated successfully!' : 'Mcu added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        })
      )
      queryClient.invalidateQueries({ queryKey: ['mcus'] });
      handleCancel()

    },
    onError: (error: any) => {
      dispatch(
        addAlert({
          message: error.message || 'Something went wrong!',
          title: mode === 'edit' ? 'Edit Failed' : 'Add Failed',
          type: 'error',
        })
      )
    },
  })

  function onSubmit(data: FormSchema) {
    mutation.mutate(data)
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Mcu' : 'Add Mcu'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update the Mcu details.' : 'Enter the Mcu details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4'>
              {/* Mcu Name Field */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mcu Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Mcu name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region Select Field */}
              <FormField
                control={form.control}
                name='region'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toLocaleString()}
                        onValueChange={(value: any) => {
                          form.setValue('region', value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a region' />
                        </SelectTrigger>
                        <SelectContent>
                          {isRegionsLoading ? (
                            <div >
                              Loading...
                            </div>
                          ) : regions?.length > 0 ? (
                            regions.map((reg: any) => (
                              <SelectItem key={reg.id} value={reg.id.toString()}>
                                {reg.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value='none'>
                              No regions found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2'>
                <Button
                  type='submit'
                  className='btn-primary'
                  disabled={mutation.isPending}
                  loading={mutation.isPending}
                >
                  {mode === 'edit' ? 'Update Mcu' : 'Create Mcu'}
                </Button>
                <Button type='button' onClick={handleCancel} variant='secondary'>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditMcu
