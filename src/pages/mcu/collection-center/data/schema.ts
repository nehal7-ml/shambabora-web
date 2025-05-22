import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const schema = z.object({
  id: z.string(),
  amcos: z.string(),
  village: z.string(),
  // amcosName: z.string().nullable(),
  // villageName: z.string().nullable(),
  name: z.string()
})

export type DataSchema = z.infer<typeof schema>
