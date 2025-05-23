import { z } from 'zod'



const cropType = z.object({
  id: z.string(),
  name: z.string(),
})


const uom = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
})
// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const schema = z.object({
  id: z.string(),
  type: cropType,
  packaging: z.string(),
  uom: uom,
  name: z.string()
})

export type DataSchema = z.infer<typeof schema>
