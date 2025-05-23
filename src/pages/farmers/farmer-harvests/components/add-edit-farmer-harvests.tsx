
import { useAppDispatch, useAppSelector } from '@/hooks/store-hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/custom/button';
import {
  getCrops,
  getAMCOSs,
  getFarmers,
  getCollectionCenters,
  updateFarmerHarvests,
  postFarmerHarvests,
  getUsersWithRole,
} from '@/helpers/api-helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addAlert } from '@/store/slices/elert-slice';
import { BagSchema, FormSchema, formSchema } from '../data/form-schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReactSelect from 'react-select';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import ThemeSwitch from '@/components/theme-switch';
import { UserNav } from '@/components/user-nav';
import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search';
import { camelToSnakeCase, snakeToCamelCase } from '@/lib/utils';
import { bagSchema, DataSchema } from "../data/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


// Custom hook to manage bags data
const useBagsForm = (form: UseFormReturn<FormSchema>) => {
  const [bags, setBags] = useState<BagSchema[]>(form.getValues('bagsData.bags') || []);

  const addBag = () => {
    setBags([...bags, {
      grade: '',
      weight: '',
      bagNumber: '',
    }]);
  };

  const removeBag = (index: number) => {
    setBags(bags.filter((_, i) => i !== index));
  };

  const updateBag = (index: number, field: keyof BagSchema, value: string | number) => {
    const updatedBags = [...bags];
    updatedBags[index] = {
      ...updatedBags[index],
      [field]: value
    };
    setBags(updatedBags);
    form.setValue('bagsData', {
      bagCount: updatedBags.length,
      bags: updatedBags
    });
  };

  return { bags, addBag, removeBag, updateBag };
};


// Component for individual bag input fields
const BagFields = ({ bag, index, updateBag, removeBag }: {
  bag: BagSchema;
  index: number;
  updateBag: (index: number, field: keyof BagSchema, value: string | number) => void;
  removeBag: (index: number) => void;
}) => {

  const form = useForm<BagSchema>({
    resolver: zodResolver(bagSchema),
    defaultValues: {}
  })
  const bagNumber = useMemo(() => "B" + (index + 1).toString().padStart(3, '0'), [index])

  useEffect(() => {
    if (!bag.bagNumber) {
      updateBag(index, 'bagNumber', bagNumber);
    }
  }, [bag.bagNumber]);


  return (
    <div className="flex gap-4 items-end mb-4">
      <Form {...form}>
        <FormItem>
          <FormLabel>Bag Number</FormLabel>
          <FormControl>
            <Input
              type="text"
              value={bag.bagNumber || bagNumber}
              placeholder="Bag Number"
              disabled={true}
              onChange={(e) => updateBag(index, 'bagNumber', e.target.value)}
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Weight in KG</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={bag.weight}
              placeholder="Weight in KG"
              onChange={(e) => updateBag(index, 'weight', e.target.value)}
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Moisture Content</FormLabel>
          <FormControl>
            <Input
              type="text"
              value={bag.grade}
              placeholder="Grade"
              onChange={(e) => updateBag(index, 'grade', e.target.value)}
            />
          </FormControl>
        </FormItem>
        <Button type="button" variant="destructive" onClick={() => removeBag(index)}>
          Remove
        </Button>
      </Form>
    </div>
  )
};

interface AddEditFarmerHarvestProps {
  mode: "add" | "edit";
  initialData?: DataSchema;
  handleCancel?: () => void;
}


const AddEditFarmerHarvest = ({ mode, initialData, handleCancel }: AddEditFarmerHarvestProps) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const location = useLocation();

  const currentUser = useAppSelector((state: any) => state?.user.userInfo)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmer: initialData?.farmer.id || '',
      receivedBy: initialData?.receivedBy.id || '',
      tumeNumber: initialData?.tumeNumber || '',
      receiptNumber: initialData?.receiptNumber || '',
      amcos: initialData?.amcos.id || '',
      collectionCenter: initialData?.collectionCenter.id || '',
      crop: initialData?.crop.id || '',
      grossWeight: initialData?.grossWeight || '',
      netWeight: initialData?.netWeight || '',
      packagingWeight: initialData?.packagingWeight || '',
      moistureContent: initialData?.moistureContent || '',
      bagsData: initialData?.bagsData || {
        bagCount: initialData?.bagsData?.bags.length || 0,
        bags: initialData?.bagsData?.bags || [],
      },
    },
  });
  const { bags, addBag, removeBag, updateBag } = useBagsForm(form);
  // Fetch Farmers
  const {
    data: farmers,
    isLoading: loadFarmers,
    // error: errorFarmers,
  } = useQuery({
    queryKey: ['user-farmers'],
    queryFn: async () => {
      const response: any = await getUsersWithRole('farmer');
      return snakeToCamelCase(response.data);
    },
  });

  const {
    data: amcosAdmins,
    isLoading: loadAmcosAdmins,
  } = useQuery({
    queryKey: ['amcosAdmins'],
    queryFn: async () => {
      const response: any = await getUsersWithRole('amcos_admin');
      return snakeToCamelCase(response.data);
    },
  })

  //Fetch union admins
  const {
    data: unionAdmins,
    isLoading: loadUnionAdmins,
  } = useQuery({
    queryKey: ['unionAdmins'],
    queryFn: async () => {
      const response: any = await getUsersWithRole('union_admin');
      return snakeToCamelCase(response.data);
    },
  });

  // Fetch Crops
  const {
    data: crops,
    isLoading: loadingCrops,
    // error: errorCrops,
  } = useQuery({
    queryKey: ['crops-select'],
    queryFn: async () => {
      const response: any = await getCrops();
      return response.data;
    },
  });

  // Fetch AMCOS
  const {
    data: amcos,
  } = useQuery({
    queryKey: ['amcos-select'],
    queryFn: async () => {
      const response: any = await getAMCOSs();
      return snakeToCamelCase(response.data);
    },
  });

  // Fetch CollectionCenter
  const {
    data: collectionCenters,
    isLoading: loadingCollectionCenter,
    // error: errorCollectionCenter,
  } = useQuery({
    queryKey: ['collection-center-select'],
    queryFn: async () => {
      const response: any = await getCollectionCenters();
      return snakeToCamelCase(response.data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'edit' && initialData) {
        return await updateFarmerHarvests(initialData.id, data);
      } else {
        return await postFarmerHarvests(data);
      }


    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message:
            mode === 'edit'
              ? 'FarmerHarvest updated successfully!'
              : 'FarmerHarvest added successfully!',
          title: mode === 'edit' ? 'Edit Success' : 'Add Success',
          type: 'success',
        }),

      );
      queryClient.invalidateQueries({ queryKey: ['farmer-harvests'] });
      handleCancel()

    },
    onError: (error: any) => {
      dispatch(
        addAlert({
          message: error.message || 'Something went wrong!',
          title: mode === 'edit' ? 'Edit Failed' : 'Add Failed',
          type: 'error',
        })
      );
    },
  });

  function onSubmit(data: FormSchema) {
    const finalData = camelToSnakeCase(data)
    console.log(finalData);

    mutation.mutate(finalData);
  }

  return (

    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className='w-full max-w-7xl '>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Harvest' : 'Add Harvest'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the Harvest details.'
              : 'Enter the Harvest details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">


                {/* Select Farmer */}
                <FormField
                  control={form.control}
                  name="farmer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Farmer" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadFarmers ?
                              <><div>
                                loading...
                              </div></> : (
                                farmers?.map((farmer: any) => (
                                  <SelectItem
                                    key={farmer.id}
                                    value={farmer.id?.toString()}
                                  >
                                    {`${farmer.email}`}
                                  </SelectItem>
                                ))
                              )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* Select Receiver */}
                <FormField
                  control={form.control}
                  name="receivedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received by</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Collected By" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadUnionAdmins && loadAmcosAdmins || (!unionAdmins || !amcosAdmins) ? (
                              <div>Loading...</div>
                            ) :
                              unionAdmins.concat(amcosAdmins ?? []).map((admin: any) => (
                                <SelectItem
                                  key={admin.id}
                                  value={admin.id?.toString()}
                                >
                                  {`${admin.email}`}
                                </SelectItem>
                              ))
                            }
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
                  name="tumeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tume Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Tume Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Weight</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Gross Weight" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="netWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Weight</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Net Weight" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="packagingWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging Weight</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Packaging Weight" type="text" {...field} />
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
                  name="moistureContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moisture Content</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Moisture Content" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Receipt Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AMCOS Multi-Select Field */}
                <FormField
                  control={form.control}
                  name="amcos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AMCOS</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select AMCOS" />
                          </SelectTrigger>
                          <SelectContent>
                            {amcos?.length > 0 ? (
                              amcos.map((amco: any) => (
                                <SelectItem
                                  key={amco.id}
                                  value={amco.id?.toString()}
                                >
                                  {amco.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div>
                                No AMCOS Found
                              </div>
                            )}
                          </SelectContent>

                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* Main Crop Select Field */}
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(field.onChange)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Crop" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingCrops ? (
                              <div>
                                Loading...
                              </div>
                            ) : crops?.length > 0 ? (
                              crops.map((crop: any) => (
                                <SelectItem
                                  key={crop.id}
                                  value={crop.id?.toString()}
                                >
                                  {crop.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div>
                                No Crops Found
                              </div>
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
                  name="collectionCenter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection center</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(field.onChange)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Collection center" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingCollectionCenter ? (
                              <div>
                                Loading...
                              </div>
                            ) : collectionCenters?.length > 0 ? (
                              collectionCenters.map((coll: any) => (
                                <SelectItem
                                  key={coll.id}
                                  value={coll.id?.toString()}
                                >
                                  {coll.amcosName}-{coll.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div>
                                No Collection center Found
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Bags</h3>
                    <Button type="button" onClick={addBag}>Add Bag</Button>
                  </div>
                  {bags.map((bag, index) => (
                    <BagFields
                      key={index}
                      bag={bag}
                      index={index}
                      updateBag={updateBag}
                      removeBag={removeBag}
                    />
                  ))}
                </div>


                {/* Submit Button */}
                <div className="mt-4 ">
                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                  >
                    {mode === 'edit' ? 'Update Farmer Harvest' : 'Create Farmer Harvest'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditFarmerHarvest;
