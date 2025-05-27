import { AMCOS } from "@/constants/api-endpoints";
import { z } from "zod";

const farmer = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string(),
})

const amcos = z.object({
  id: z.string(),
  name: z.string(),

})
export const schema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.string(),
  farmer: farmer,
  amcos: amcos,
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).nullable(),
  trees: z.number().default(0),
})

export type DataSchema = z.infer<typeof schema>;
