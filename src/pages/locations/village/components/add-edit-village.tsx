import * as React from 'react'
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
  getRDistrict,
  getRegions,
  getRWards,
  postLocationVillages,
  updateVillages,
} from '@/helpers/api-helper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAlert } from '@/store/slices/elert-slice'
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Please enter Village name' }),
  region: z.string().min(1, { message: 'Please select region' }),
  district: z.string().min(1, { message: 'Please select district' }),
  ward: z.string().min(1, { message: 'Please select ward' }),
})

type FormSchema = z.infer<typeof formSchema>

interface AddEditVillageProps {
  mode: 'add' | 'edit'
  initialData?: { name: string; id: number; ward: any } | null
  handleCancel: () => void
}

const AddEditVillage = ({
  mode,
  initialData,
  handleCancel,
}: AddEditVillageProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      ward: initialData?.ward?.toString() || '',
    },
  })

  const { data: regions, isLoading: isRegionsLoading, } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response: any = await getRegions();
      return response.data;
    },
  })

  const { data: districts, isLoading: isDistrictsLoading, } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const response: any = await getRDistrict();
      return response.data;
    },
  })

  const { data: wards, isLoading: isWardsLoading, } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const response: any = await getRWards();
      return response.data;
    },
  })

  const [selectedRegion, setSelectedRegion] = React.useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = React.useState<number | null>(null);

  const filteredDistricts = selectedRegion
    ? districts?.filter((district: any) => district.region === selectedRegion)
    : []

  const filteredWards = selectedDistrict
    ? wards?.filter((ward: any) => ward.district === selectedDistrict)
    : []

  const mutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      if (mode === 'edit' && initialData?.id) {
        return await updateVillages(initialData.id, {
          name: data.name,
          ward: data.ward,
        })
      } else {
        return await postLocationVillages({
          name: data.name,
          ward: data.ward,
        })
      }
    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message: mode === 'edit' ? 'Village updated successfully!' : 'Village added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        })
      )
      queryClient.invalidateQueries({ queryKey: ['villages'] })
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

  // Handle form submission
  function onSubmit(data: FormSchema) {
    mutation.mutate(data)
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Village' : 'Add Village'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update the Village details.' : 'Enter the Village details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4'>
              {/* Village Name Field */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Village name' {...field} />
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
                        value={field.value?.toLocaleString()}
                        onValueChange={(value: any) => {
                          const regionId = value
                          form.setValue('region', value)
                          setSelectedRegion(regionId)
                          // Reset district and ward when region changes
                          // form.setValue('district', null)
                          setSelectedDistrict(null)
                          // form.setValue('ward', '')
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a region' />
                        </SelectTrigger>
                        <SelectContent>
                          {isRegionsLoading ? (
                            <div>
                              Loading...
                            </div>
                          ) : regions?.length > 0 ? (
                            regions.map((reg: any) => (
                              <SelectItem key={reg.id} value={reg.id.toString()}>
                                {reg.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div>
                              No regions found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District Select Field */}
              <FormField
                control={form.control}
                name='district'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toLocaleString()}
                        onValueChange={(value: any) => {
                          const districtId = value
                          form.setValue('district', value)
                          setSelectedDistrict(districtId)
                          // Reset ward when district changes
                          // form.setValue('ward', '')
                        }}
                        disabled={!selectedRegion || isDistrictsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a district' />
                        </SelectTrigger>
                        <SelectContent>
                          {isDistrictsLoading ? (
                            <div>
                              Loading...
                            </div>
                          ) : filteredDistricts?.length > 0 ? (
                            filteredDistricts.map((district: any) => (
                              <SelectItem key={district.id} value={district.id.toString()}>
                                {district.name}
                              </SelectItem>
                            ))
                          ) : selectedRegion ? (
                            <div>
                              No districts found
                            </div>
                          ) : (
                            <div>
                              Select a region first
                            </div>

                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ward Select Field */}
              <FormField
                control={form.control}
                name='ward'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toLocaleString()}
                        onValueChange={(value: any) => {
                          form.setValue('ward', value)
                        }}
                        disabled={!selectedDistrict || isWardsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a ward' />
                        </SelectTrigger>
                        <SelectContent>
                          {isWardsLoading ? (
                            <div>
                              Loading...
                            </div>
                          ) : filteredWards?.length > 0 ? (
                            filteredWards.map((ward: any) => (
                              <SelectItem key={ward.id} value={ward.id.toString()}>
                                {ward.name}
                              </SelectItem>
                            ))
                          ) : selectedDistrict ? (
                            <div>
                              No wards found
                            </div>

                          ) : (
                            <div>
                              Select a district first
                            </div>
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
                  {mode === 'edit' ? 'Update Village' : 'Create Village'}
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

export default AddEditVillage
