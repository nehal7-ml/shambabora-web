import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const schema = z.object({
  id: z.string(),
  name: z.string(),
  ward: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type DataSchema = z.infer<typeof schema>
