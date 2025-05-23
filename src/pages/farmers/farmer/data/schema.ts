import { z } from 'zod'


const relatedData = z.object({
  id: z.string(),
  name: z.string(),
})

export const schema = z.object({
  id: z.string(),

  firstName: z.string().nullable(),
  lastName: z.string().nullable(),

  sex: z.string().nullable().optional(),

  idType: z.string().nullable(),
  idNumber: z.string().nullable(),

  dob: z.string().nullable().refine((val) => !val || !isNaN(Date.parse(val))).transform((val) => new Date(val)),

  educationLevel: z.string().nullable(),

  driversLicense: z.string().nullable(),
  tinNumber: z.string().nullable(),
  ttbNumber: z.string().nullable(),
  voterId: z.string().nullable(),


  phoneNumber: z.string().regex(/^\d+$/).nullable(),

  amcosMemberId: z.string().nullable(),

  mainCrop: z.number().nullable().optional(),
  secondaryCrop: z.number().nullable().optional(),

  amcos: relatedData.nullable(),
});


export type DataSchema = z.infer<typeof schema>
