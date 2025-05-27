import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAMCOSs, postFarmer, postFarms, updateFarm } from "@/helpers/api-helper";
import { useAppDispatch } from "@/hooks/store-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FormSchema, formSchema } from "../data/formSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addAlert } from "@/store/slices/elert-slice";
import { camelToSnakeCase } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/custom/button";
import { DataSchema } from "../data/schema";

interface AddEditFarmsProps {
  handleCancel: () => void;
  mode: "add" | "edit";
  farmerUserId: string;
  farmerId: string;
  initialData?: DataSchema;

}

const AddEditFarms = ({ initialData, farmerUserId, farmerId, handleCancel, mode }: AddEditFarmsProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      size: initialData?.size || "",
      farmer: farmerUserId,
      coordinates: {
        latitude: initialData?.coordinates.latitude || 0,
        longitude: initialData?.coordinates.longitude || 0,
      },
      amcos: initialData?.amcos.id || null,
      trees: initialData?.trees || undefined,
    },
  })

  console.log(initialData);
  const { data: amcos, isLoading: isAmcosLopading } = useQuery({
    queryKey: ["amcos-select"],
    queryFn: async () => {
      const response = await getAMCOSs();
      return response.data;
    },
  })
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'edit' && initialData) {
        return await updateFarm(initialData.id, data);
      } else {
        return await postFarms(data);
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
      queryClient.invalidateQueries({ queryKey: ['farms', farmerId] });
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
    const finalData = camelToSnakeCase({
      ...data,
      trees: Number(data.trees),

    })
    console.log(finalData);

    mutation.mutate(finalData);
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add/Edit Farm</DialogTitle>
          <DialogDescription>
            {initialData ? "Edit Farm" : "Add New Farm"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Farm name <span className='text-red-500'>*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Farm name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Farm Size (acres) <span className='text-red-500'>*</span></FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter Farm Size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-2">Location <span className='text-red-500'>*</span> </div>

              <div className="flex gap-2 px-3">
                <FormField
                  control={form.control}
                  name="coordinates.latitude"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="X coordinate" {...field} onChange={(e) => { form.setValue("coordinates.latitude", Number(e.target.value)) }} />

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coordinates.longitude"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Y coordinate" {...field} onChange={(e) => { form.setValue("coordinates.longitude", Number(e.target.value)) }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />




              </div>
              {/* AMCOS Multi-Select Field */}
              <FormField
                control={form.control}
                name="amcos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AMCOS <span className='text-red-500'>*</span></FormLabel>
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
                  </FormItem>)}
              />

              <FormField
                control={form.control}
                name="trees"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Number of Trees</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          console.log(e)
                          form.setValue("trees", Number(e.target.value))
                        }}
                        type="number"
                        placeholder="Enter Number of Trees" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

            </div>
            {/* Submit Button */}
            <div className="mt-4 ">
              <Button
                type="submit"
                className="btn-primary w-full"
                disabled={mutation.isPending}
                loading={mutation.isPending}
              >
                {mode === 'edit' ? 'Update Farm' : 'Create Farm'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )


}


export default AddEditFarms
