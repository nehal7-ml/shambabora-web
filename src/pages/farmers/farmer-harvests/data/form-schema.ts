
import { z } from 'zod';


export const bagFormSchema = z.object({
  grade: z.string().min(1, { message: 'Please select grade' }),
  weight: z.string().min(1, { message: 'Please enter weight' }), // e.g. "41.5 kg"
  bagNumber: z.string().min(1, { message: 'Please enter bag number' }),
});



export const formSchema = z.object({
  farmerId: z.string().min(1, { message: 'Please select farmer' }),
  receivedBy: z.string().min(1, { message: 'Please select received by' }),
  receiptNumber: z.string().min(1, { message: 'Please enter member ID' }),
  tumeNumber: z.string().min(1, { message: 'Please enter tume number' }),
  amcos: z.string().min(1, { message: 'Please select amcos' }),
  crop: z.string().min(1, { message: 'Please select secondary crop' }),
  collectionCenter: z.string().min(1, { message: 'Please select collection center' }),
  grossWeight: z.string().min(1, { message: 'Please enter gross weight' }),
  netWeight: z.string().min(1, { message: 'Please enter net weight' }),
  packagingWeight: z.string().min(1, { message: 'Please enter packaging weight' }),
  moistureContent: z.string().min(1, { message: 'Please enter moisture content' }),
  bagsData: z.object({
    bagCount: z.number(),
    bags: z.array(
      bagFormSchema
    )
  })
});

export type BagSchema = z.infer<typeof bagFormSchema>;
export type FormSchema = z.infer<typeof formSchema>;
