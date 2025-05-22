import { z } from 'zod'


export const schema = z.object({
  id: z.string(),
  uuid: z.string(),

  email: z.string().email(),
  phoneNumber: z.string().regex(/^[\d-]+$/, { message: "Invalid phone number format" }),
  role: z.string(),

  createdBy: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),

  isActive: z.boolean(),
  isVerified: z.boolean(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DataSchema = z.infer<typeof schema>
