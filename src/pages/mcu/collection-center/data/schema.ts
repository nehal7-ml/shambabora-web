import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.


const village = z.object({
  id: z.string(),
  name: z.string(),
})

const amcos = z.object({
  id: z.string(),
  name: z.string(),
})
export const schema = z.object({


  id: z.string(),
  amcos: amcos,
  village: village,
  // amcosName: z.string().nullable(),
  // villageName: z.string().nullable(),
  name: z.string()
})

export type DataSchema = z.infer<typeof schema>
