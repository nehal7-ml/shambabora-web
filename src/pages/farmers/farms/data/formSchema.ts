import { z } from "zod";


export const formSchema = z.object({
  name: z.string(),
  size: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  farmer: z.string().min(1, { message: "Farmer is required" }),
  amcos: z.string().min(1, { message: "AMCOS is required" }),
  trees: z.number().default(0),
});

export type FormSchema = z.infer<typeof formSchema>;
