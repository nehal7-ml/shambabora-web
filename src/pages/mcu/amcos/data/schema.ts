import { idea } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.


const relatedData = z.object({
  id: z.string(),
  name: z.string(),
})
export const schema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Please enter Amcos name" }),
  memberCategory: z.string().min(1, { message: "Please select member category" }).optional(),
  registrationNumber: z.string().min(1, { message: "Please enter registration number" }).optional(),
  tinNumber: z.string().min(1, { message: "Please enter TIN number" }).optional(),
  mcu: relatedData,
  region: relatedData,
  district: relatedData,
  ward: relatedData,
  village: relatedData,
  address: z.string().min(1, { message: "Please enter address" }),
  phoneNumber: z.string().min(1, { message: "Please enter phone number" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  website: z.string().url().optional(),
});

export type DataSchema = z.infer<typeof schema>
