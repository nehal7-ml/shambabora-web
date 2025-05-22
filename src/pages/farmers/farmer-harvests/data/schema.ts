import { z } from 'zod';

export const bagSchema = z.object({
  grade: z.string(),
  weight: z.string(), // e.g. "41.5 kg"
  bagNumber: z.string(),
});

export const schema = z.object({
  id: z.string(), // UUID

  grossWeight: z.string(),       // "124.5 kg"
  netWeight: z.string(),         // "120.2 kg"
  packagingWeight: z.string(),   // "4.3 kg"
  moistureContent: z.string(),   // "12.5%"

  bagsData: z.object({
    bagCount: z.number(),
    bags: z.array(bagSchema),
  }),

  receiptNumber: z.string(),     // UUID
  farmer: z.string(),            // UUID
  amcos: z.string(),             // UUID
  receivedBy: z.string(),        // UUID
  crop: z.string(),              // UUID
  collectionCenter: z.string(),  // UUID
  tumeNumber: z.string(),

  createdBy: z.string(),         // UUID

  tablet: z.string().nullable(),
  scale: z.string().nullable(),
  printer: z.string().nullable(),

  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
});

export type DataSchema = z.infer<typeof schema>;
