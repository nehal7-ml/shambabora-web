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
  getRVillages,
  getAMCOSs,
  postCollectionCenter,
  updateCollectionCenter
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
  name: z.string().min(1, { message: 'Please enter collection center name' }),
  amcos: z.string().min(1, { message: 'Please select amcos ' }),
  village: z.string().min(1, { message: 'Please choose village ' }),
})

interface AddEditCollectionCenterProps {
  mode: 'add' | 'edit'
  initialData?: {
    name: string
    id: number
    amcos: number
    village: number
  } | any
  handleCancel: () => void
}

const AddEditCollectionCenter = ({ mode, initialData, handleCancel }: AddEditCollectionCenterProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      amcos: initialData?.amcos,
      village: initialData?.village,

    },
  })

  const { data: villages, isLoading: loadingVillages } = useQuery({
    queryKey: ['villages'],
    queryFn: async () => {
      const response: any = await getRVillages()
      console.log(response)
      return response.data
    },
  })

  const { data: amcoss, isLoading: loadAmcos } = useQuery({
    queryKey: ['amcos'],
    queryFn: async () => {
      const response: any = await getAMCOSs()
      console.log(response)
      return response.data
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'edit' && initialData?.id) {
        return await updateCollectionCenter(initialData.id, data)
      } else {
        return await postCollectionCenter(data)
      }
    },

    onSuccess: () => {
      dispatch(
        addAlert({
          message:
            mode === 'edit'
              ? 'Collection Center updated successfully!'
              : 'Collection Center added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        })
      )
      handleCancel()
      //ts-ignore
      queryClient.invalidateQueries({ queryKey: ['collectionCenters'] })
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    const finalData = {
      ...data,
      amcos: (data.amcos),
      village: (data.village),
    }
    mutation.mutate(finalData)
  }
  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit CollectionCenter' : 'Add CollectionCenter'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the CollectionCenter details.'
              : 'Enter the CollectionCenter details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Collection center name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter CollectionCenter name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amcos'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amcos</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toLocaleString()}
                        onValueChange={(value: any) => {
                          form.setValue('amcos', value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a Amcos' />
                        </SelectTrigger>
                        <SelectContent>
                          {loadAmcos ? (
                            <div>Loading...</div>
                          ) : amcoss?.length > 0 ? (
                            amcoss.map((ctyp: any) => (
                              <SelectItem
                                key={ctyp.id}
                                value={ctyp.id.toString()}
                              >
                                {ctyp.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value='none'>
                              No amcos type found
                            </SelectItem>
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
                name='village'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toLocaleString()}
                        onValueChange={(value: any) => {
                          form.setValue('village', value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a village' />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingVillages ? (
                            <div>Loading...</div>
                          ) : villages?.length > 0 ? (
                            villages.map((unit: any) => (
                              <SelectItem
                                key={unit.id}
                                value={unit.id.toString()}
                              >
                                {unit.wardName}-{unit.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value='none'>
                              No units found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button
                type='submit'
                className='btn'
                loading={mutation.isPending}
              >
                {mode === 'edit' ? 'Update Collection Center' : 'Create Collection Center'}{' '}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditCollectionCenter
