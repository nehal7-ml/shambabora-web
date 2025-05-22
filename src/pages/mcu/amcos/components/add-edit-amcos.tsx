// AddEditAmcos.tsx
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
  getCrops,
  getRVillages,
  getMCUs,
  postAMCOS,
  updateAMCOS,
  getRWards,
  getRegions,
  getRDistrict,
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
import MultiSelectReactSelect from './multiselect-crops'
import { camelToSnakeCase } from "@/lib/utils"
import { DataSchema } from "../data/schema"
// import { FormSchema, formSchema } from './formSchema';
// import { MeasurementUnit, Village, Crop, AddEditAmcosData } from './types';

interface AddEditAmcosProps {
  mode: 'add' | 'edit'
  //@ts-ignore
  initialData?: DataSchema| null
  handleCancel: () => void
}

export const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter Amcos name" }),
  memberCategory: z.string().min(1, { message: "Please select member category" }),
  registrationNumber: z.string().min(1, { message: "Please enter registration number" }),
  tinNumber: z.string().min(1, { message: "Please enter TIN number" }),
  mcu: z.string().min(1, { message: "Please choose an MCU" }),
  region: z.string().min(1, { message: "Please choose a region" }),
  district: z.string().min(1, { message: "Please choose a district" }),
  ward: z.string().min(1, { message: "Please choose a ward" }),
  village: z.string().min(1, { message: "Please select a village" }),
  address: z.string().min(1, { message: "Please enter address" }),
  phoneNumber: z.string().min(1, { message: "Please enter phone number" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  website: z.string().url().optional(),
})

type FormSchema = z.infer<typeof formSchema>

interface AddEditAmcosProps {
  mode: 'add' | 'edit'
  //@ts-ignore
  initialData?:
  | {
    name: string
    id: number

    contactPhoneNumber: string
    // mcu: any;
    // village: any;
    // crops: any[];
  }
  | any
  handleCancel: () => void
}
const AddEditAmcos = ({
  mode,
  initialData,
  handleCancel,
}: AddEditAmcosProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      memberCategory: initialData?.memberCategory || '',
      registrationNumber: initialData?.registrationNumber || '',
      tinNumber: initialData?.tinNumber || '',
      mcu: initialData?.mcu ? initialData.mcu.toString() : '',
      region: initialData?.region ? initialData.region.toString() : '',
      district: initialData?.district ? initialData.district.toString() : '',
      ward: initialData?.ward ? initialData.ward.toString() : '',
      village: initialData?.village ? initialData.village.toString() : '',
      address: initialData?.address || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      website: initialData?.website || '',
    },
  })

  // Fetch Mcus (mcu)
  const {
    data: mcus,
    isLoading: loadingMCU,
  } = useQuery({
    queryKey: ['mcus'],
    queryFn: async () => {
      const response: any = await getMCUs()
      return response.data
    },
  })

  // Fetch Villages
  const {
    data: villages,
    isLoading: loadingVillages,
  } = useQuery({
    queryKey: ['villages'],
    queryFn: async () => {
      const response: any = await getRVillages()
      return response.data
    },
  })

  // Fetch Wards
  const {
    data: wards,    
    isLoading: loadingWards,
  } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const response: any = await getRWards()
      return response.data
    },
  })

  // Fetch Districts
  const {
    data: districts,
    isLoading: loadingDistricts,
  } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const response: any = await getRDistrict()
      return response.data
    },
  }) 

  // Fetch Regions
  const {
    data: regions,
    isLoading: loadingRegions,
  } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response: any = await getRegions()
      return response.data
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'edit' && initialData?.id) {
        return await updateAMCOS(initialData?.id, data)
      } else {
        return await postAMCOS(data)
      }
    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message:
            mode === 'edit'
              ? 'Amcos updated successfully!'
              : 'Amcos added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        })
      )
      queryClient.invalidateQueries({ queryKey: ['amcos'] })
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
    const finalData = camelToSnakeCase(data)
    console.log(finalData)

    mutation.mutate(finalData);
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Amcos' : 'Add Amcos'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the Amcos details.'
              : 'Enter the Amcos details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid grid-cols-2 gap-4'>
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter AMCOS name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Member Category */}
              <FormField
                control={form.control}
                name="memberCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Member Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Registration Number */}
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter registration number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TIN Number */}
              <FormField
                control={form.control}
                name="tinNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TIN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter TIN number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MCU */}
              <FormField
                control={form.control}
                name="mcu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MCU</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select MCU" />
                        </SelectTrigger>
                        <SelectContent>
                          {mcus?.map((item: any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region */}
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions?.map((item:any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts?.map((item:any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ward */}
              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {wards?.map((item:any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Village */}
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Village" />
                        </SelectTrigger>
                        <SelectContent>
                          {villages?.map((item: any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter website URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Submit Button */}
              <Button
                type='submit'
                className='btn-primary'
                disabled={mutation.isPending}
                loading={mutation.isPending}
              >
                {mode === 'edit' ? 'Update Amcos' : 'Create Amcos'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditAmcos
