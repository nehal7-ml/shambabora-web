// AddEditTraining.tsx
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
import {
  getAMCOSs,
  postTraining,
  updateTraining,
} from '@/helpers/api-helper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAlert } from '@/store/slices/elert-slice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  id: z.number().optional(),
  trainer: z.string().min(1, { message: 'Please enter a trainer name' }),
  amcos: z.number({ required_error: 'Please select an AMCOS' }),
  farmers: z.array(z.any()).optional(),
  date: z.string().min(1, { message: 'Please select a date' }),
  startTime: z.string().min(1, { message: 'Please select a start time' }),
  endTime: z.string().min(1, { message: 'Please select an end time' }),
  location: z.string().min(1, { message: 'Please enter a location' }),
  name: z.string().min(1, { message: 'Please enter a training name' }),
  description: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

interface AddEditTrainingProps {
  mode: 'add' | 'edit'
  initialData?: FormSchema | null
  handleCancel: () => void
}

const AddEditTraining = ({ mode, initialData, handleCancel }: AddEditTrainingProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainer: initialData?.trainer || '',
      amcos: initialData?.amcos || undefined,
      farmers: initialData?.farmers || [],
      date: initialData?.date || '',
      startTime: initialData?.startTime || '',
      endTime: initialData?.endTime || '',
      location: initialData?.location || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  })

  // Fetch AMCOS
  const { data: amcosList, isLoading: loadingAMCOS } = useQuery({
    queryKey: ['amcos-select'],
    queryFn: async () => {
      const response: any = await getAMCOSs()
      return response
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      if (mode === 'edit' && initialData?.id) {
        return await updateTraining(initialData.id, data)
      } else {
        return await postTraining(data)
      }
    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message:
            mode === 'edit'
              ? 'Training updated successfully!'
              : 'Training added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        })
      )
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
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
          <DialogTitle>
            {mode === 'edit' ? 'Edit Training' : 'Add Training'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the training details.'
              : 'Enter the training details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter training name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trainer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter trainer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amcos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AMCOS</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => form.setValue('amcos', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an AMCOS" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingAMCOS ? (
                              <div>Loading...</div>
                            ) : amcosList?.length > 0 ? (
                              amcosList.map((amcos: any) => (
                                <SelectItem key={amcos.id} value={amcos.id?.toString()}>
                                  {amcos.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div>No AMCOS found</div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <Button
                type="submit"
                className="btn-primary"
                disabled={mutation.isPending}
                loading={mutation.isPending}
              >
                {mode === 'edit' ? 'Update Training' : 'Create Training'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditTraining
