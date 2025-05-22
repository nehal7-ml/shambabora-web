import { z } from "zod";

export const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phoneNumber: z.string().regex(/^[\d-]+$/, { message: "Invalid phone number format" }),
  role: z.string().min(1, { message: "Please select a role" }),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // dob: z
  //   .string()
  //   .optional()
  //   .refine((date) => !date || !isNaN(Date.parse(date)), {
  //     message: "Invalid Date",
  //   })
  //   .transform((date) => (date ? new Date(date) : undefined)),
});



export type FormSchema = z.infer<typeof formSchema>;
