// AddEditFarmer.tsx
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import {
  getCrops,
  getAMCOSs,
  postFarmer,
  updateFarmer,
  postUser,
  updateUser,
} from '@/helpers/api-helper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAlert } from '@/store/slices/elert-slice'
import { FormSchema, formSchema } from '../data/form-schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { camelToSnakeCase } from '@/lib/utils'

interface AddEditFarmerProps {
  mode: 'add' | 'edit'
  //@ts-ignore
  initialData?: {
    id: number
    email: string
    password: string
    role: string
    firstName: string
    lastName: string
    phoneNumber: string
   
    // mainCrop: number
    // secondaryCrop: number
  } | null
  handleCancel: () => void
}

const AddEditFarmer = ({
  mode,
  initialData,
  handleCancel,
}: AddEditFarmerProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const handleImageChange = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        setImageBase64(reader.result.toString())
      }
    }
    reader.readAsDataURL(file)
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || '',
      password: initialData?.password || '',
      role: initialData?.role || 'farmer',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phoneNumber: initialData?.phoneNumber || '',

    },
  })

  // Fetch Crops
  const { data: crops, isLoading: loadingCrops } = useQuery({
    queryKey: ['crops-select'],
    queryFn: async () => {
      const response: any = await getCrops()
      return response.data
    },
  })

  // Fetch AMCOS
  const {
    data: amcos,
    // isLoading: loadingAmcos,
  } = useQuery({
    queryKey: ['amcos-select'],
    queryFn: async () => {
      const response: any = await getAMCOSs()
      return response.data
    },
  })


  const mutation = useMutation({
    mutationFn: async (data: any) => {

      if (mode === 'edit' && initialData) {
        return await updateUser(initialData.id, data)
      } else {
        return await postUser(data)
      }
    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message:
            mode === 'edit'
              ? 'Farmer updated successfully!'
              : 'Farmer added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        })
      )
      queryClient.invalidateQueries({ queryKey: ['farmers'] })
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


    let finalData = camelToSnakeCase(data);

    mutation.mutate(finalData)
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className=''>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit User' : 'Add User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the Farmer details.'
              : 'Enter the Farmer details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid'>
              {/* Left Column */}
              <div className='space-y-4'>
                {/* First Name Field */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField control={form.control} name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter password' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>

                  )} />

                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Enter First Name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Enter Last Name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sex Select Field */}
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Role<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: any) =>
                            form.setValue('role', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select role' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='farmer'>Farmer</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number Field */}
                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Enter Phone Number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name='amcos' */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel> */}
                {/*         AMCOS <span className='text-red-500'>*</span> */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}
                {/**/}
                {/* Member ID Field */}
                {/* Submit Button */}
                <div className='mt-4'>
                  <Button
                    type='submit'
                    className='btn-primary w-full'
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                  >
                    {mode === 'edit' ? 'Update Farmer' : 'Create Farmer'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditFarmer
