import { z } from 'zod';


const relatedData = z.object({
  id: z.string(),
  name: z.string(),
})


const receivedBySchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string(),
})
const farmerSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string(),
})
export const bagSchema = z.object({
  grade: z.string(),
  weight: z.string(), // e.g. "41.5 kg"
  bagNumber: z.string(),
});

export const schema = z.object({
  id: z.string(), // UUID

  farmer: farmerSchema,            // UUID
  amcos: relatedData,             // UUID
  crop: relatedData,              // UUID
  collectionCenter: relatedData,  // UUID
  receivedBy: receivedBySchema,        // UUID


  grossWeight: z.string(),       // "124.5 kg"
  netWeight: z.string(),         // "120.2 kg"
  packagingWeight: z.string(),   // "4.3 kg"
  moistureContent: z.string(),   // "12.5%"

  bagsData: z.object({
    bagCount: z.number(),
    bags: z.array(bagSchema),
  }),

  receiptNumber: z.string(),     // UUID
  tumeNumber: z.string(),

  createdBy: z.string(),         // UUID

  tablet: z.string().nullable(),
  scale: z.string().nullable(),
  printer: z.string().nullable(),

  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
});

export type DataSchema = z.infer<typeof schema>;
