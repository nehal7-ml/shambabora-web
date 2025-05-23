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
} from '@/helpers/api-helper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAlert } from '@/store/slices/elert-slice'
import MultiSelectReactSelect from './multiselect'
import { FormSchema, formSchema } from '../data/form-schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { camelToSnakeCase } from '@/lib/utils'

interface AddEditFarmerProps {
  mode: 'add' | 'edit'
  //@ts-ignore
  initialData?: {
    id: string,
    uuid: string
    firstName: string
    lastName: string
    sex: string
    idNumber: string
    idType: 'NIN' | 'VOTER' | 'OTHER'
    dob: Date
    phoneNumber: string
    educationLevel:
    | 'PRIMARY'
    | 'SECONDARY'
    | 'HIGH_SCHOOL'
    | 'CERTIFICATE'
    | 'DIPLOMA'
    | 'UNIVERSITY_GRADUATE'
    | 'UNIVERSITY_MASTERS'
    | 'UNIVERSITY_PHD'
    | 'NON_FORMAL_EDUCATION'
    amcosMemberId: string
    amcos: { id: string }
    image: string
    ttbNumber: string
    tinNumber: string
    voterId: string
    driversLicense: string
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
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      sex: initialData?.sex || '',
      idNumber: initialData?.idNumber || '',
      idType: initialData?.idType || '',
      //@ts-ignore
      dob: initialData?.dob ? initialData.dob.toISOString().split('T')[0] : '',
      phoneNumber: initialData?.phoneNumber || '',
      //@ts-ignore
      educationLevel: initialData?.educationLevel || '',
      amcosMemberId: initialData?.amcosMemberId || '',
      amcos: initialData?.amcos ? initialData.amcos?.id : "",
      image: initialData?.image || '',
      ttbNumber: initialData?.ttbNumber || '',
      tinNumber: initialData?.tinNumber || '',
      voterId: initialData?.voterId || '',
      driversLicense: initialData?.driversLicense || '',
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
        return await updateFarmer(initialData.id, data)
      } else {
        return await postFarmer(data)
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
    let finalData = {
      ...data,
      // uuid: initialData.uuid ?? undefined,
      amcos: data.amcos
    }
    if (imageBase64) {
      finalData.image = imageBase64
    }

    delete finalData.image // remove line when Image is added to DataBase

    finalData = camelToSnakeCase(finalData);

    mutation.mutate(finalData)
  }



  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className='w-full max-w-7xl '>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Farmer' : 'Add Farmer'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the Farmer details.'
              : 'Enter the Farmer details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Left Column */}
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        {/* @ts-ignore */}
                        <Input
                          placeholder='Farmer Image'
                          type='file'
                          onChange={(e) =>
                            handleImageChange(e?.target?.files[0])
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* {imageBase64 && <img src={imageBase64} alt="Uploaded" style={{ marginTop: 10, maxWidth: '100%'  }} />} */}
                {/* First Name Field */}
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

                {/* Middle Name Field */}
                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name='middleName' */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel> */}
                {/*         Middle Name <span className='text-red-500'>*</span> */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*         <Input placeholder='Enter Middle Name' {...field} /> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}
                {/**/}
                {/* Last Name Field */}
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
                  name='sex'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sex <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: any) =>
                            form.setValue('sex', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select Sex' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='MALE'>Male</SelectItem>
                            <SelectItem value='FEMALE'>Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Education Level Select Field */}
                <FormField
                  control={form.control}
                  name='educationLevel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Education Level <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: any) =>
                            form.setValue('educationLevel', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select Education Level' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='PRIMARY'>Primary</SelectItem>
                            <SelectItem value='SECONDARY'>Secondary</SelectItem>
                            <SelectItem value='HIGH_SCHOOL'>
                              High School
                            </SelectItem>
                            <SelectItem value='CERTIFICATE'>
                              Certificate
                            </SelectItem>
                            <SelectItem value='DIPLOMA'>Diploma</SelectItem>
                            <SelectItem value='UNIVERSITY_GRADUATE'>
                              University Graduate
                            </SelectItem>
                            <SelectItem value='UNIVERSITY_MASTERS'>
                              University Masters
                            </SelectItem>
                            <SelectItem value='UNIVERSITY_PHD'>
                              University PhD
                            </SelectItem>
                            <SelectItem value='NON_FORMAL_EDUCATION'>
                              Non Formal Education
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth Field */}
                <FormField
                  control={form.control}
                  name='dob'
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>
                        Date of birth <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          placeholder='Enter Date of Birth'
                          {...field}
                        />
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

                {/* ID Type Select Field */}
                <FormField
                  control={form.control}
                  name='idType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        ID Type <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: any) =>
                            form.setValue('idType', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select ID Type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='NIN'>NIN</SelectItem>
                            <SelectItem value='VOTER'>VOTER</SelectItem>
                            <SelectItem value='OTHER'>OTHER</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID Number Field */}
                <FormField
                  control={form.control}
                  name='idNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        ID Number <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Enter ID Number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className='space-y-4'>
                {/* AMCOS Member ID Field */}
                <FormField
                  control={form.control}
                  name='amcosMemberId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        AMCOS Member ID <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Enter AMCOS Member ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Main Crop Select Field */}
                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name='mainCrop' */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel> */}
                {/*         Main Crop <span className='text-red-500'>*</span> */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*         <Select */}
                {/*           value={field.value?.toString()} */}
                {/*           onValueChange={(value: any) => */}
                {/*             form.setValue('mainCrop', value) */}
                {/*           } */}
                {/*         > */}
                {/*           <SelectTrigger> */}
                {/*             <SelectValue placeholder='Select Main Crop' /> */}
                {/*           </SelectTrigger> */}
                {/*           <SelectContent> */}
                {/*             {loadingCrops ? ( */}
                {/*               <div>Loading...</div> */}
                {/*             ) : crops?.length > 0 ? ( */}
                {/*               crops.map((crop: any) => ( */}
                {/*                 <SelectItem */}
                {/*                   key={crop.id} */}
                {/*                   value={crop.id?.toString()} */}
                {/*                 > */}
                {/*                   {crop.name} */}
                {/*                 </SelectItem> */}
                {/*               )) */}
                {/*             ) : ( */}
                {/*               <div>No Crops Found</div> */}
                {/*             )} */}
                {/*           </SelectContent> */}
                {/*         </Select> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}

                {/* Secondary Crop Select Field */}
                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name='secondaryCrop' */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel> */}
                {/*         Secondary Crop <span className='text-red-500'>*</span> */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*         <Select */}
                {/*           value={field.value?.toString()} */}
                {/*           onValueChange={(value: any) => */}
                {/*             form.setValue('secondaryCrop', value) */}
                {/*           } */}
                {/*         > */}
                {/*           <SelectTrigger> */}
                {/*             <SelectValue placeholder='Select Secondary Crop' /> */}
                {/*           </SelectTrigger> */}
                {/*           <SelectContent> */}
                {/*             {loadingCrops ? ( */}
                {/*               <div>Loading...</div> */}
                {/*             ) : crops?.length > 0 ? ( */}
                {/*               crops.map((crop: any) => ( */}
                {/*                 <SelectItem */}
                {/*                   key={crop.id} */}
                {/*                   value={crop.id?.toString()} */}
                {/*                 > */}
                {/*                   {crop.name} */}
                {/*                 </SelectItem> */}
                {/*               )) */}
                {/*             ) : ( */}
                {/*               <div>No Crops Found</div> */}
                {/*             )} */}
                {/*           </SelectContent> */}
                {/*         </Select> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}
                {/**/}
                {/* AMCOS Multi-Select Field */}
                <FormField
                  control={form.control}
                  name='amcos'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        AMCOS <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select AMCOS' />
                          </SelectTrigger>
                          <SelectContent>
                            {amcos?.length > 0 ? (
                              amcos.map((amcos: any) => (
                                <SelectItem
                                  key={amcos.id}
                                  value={amcos.id}
                                >
                                  {amcos.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled value='none'>
                                No AMCOS Found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Member ID Field */}
                <FormField
                  control={form.control}
                  name='tinNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tin number</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter tin number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Member ID Field */}
                <FormField
                  control={form.control}
                  name='ttbNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ttb number</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter ttb number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Voter ID Field */}
                <FormField
                  control={form.control}
                  name='voterId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voter ID</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter Voter ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Drivers License Field */}
                <FormField
                  control={form.control}
                  name='driversLicense'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drivers License</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter Drivers License' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
