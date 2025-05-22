
import { z } from 'zod';

export const formSchema = z.object({
  firstName: z.string().min(1, { message: 'Please enter first name' }),
  lastName: z.string().min(1, { message: 'Please enter last name' }),
  dob: z
    .string()
    .min(1, { message: 'Please enter Date of Birth' })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid Date',
    })
    .transform((date) => new Date(date)),
  idType: z.string().min(1, { message: 'Please select ID Type' }),
  sex: z.string().min(1, { message: 'Please select sex' }),
  idNumber: z.string().min(1, { message: 'Please enter ID number' }),
  phoneNumber: z.string().min(1, { message: 'Please enter phone number' }),
  amcosMemberId: z.string().min(1, { message: 'Please enter AMCOS Member ID' }),
  // mainCrop: z.string().min(1, { message: 'Please select main crop' }).transform(Number),
  // secondaryCrop: z.string().min(1, { message: 'Please select secondary crop' }).transform(Number),
  educationLevel: z.enum([
    "PRIMARY",
    "SECONDARY",
    "HIGH_SCHOOL",
    "CERTIFICATE",
    "DIPLOMA",
    "UNIVERSITY_GRADUATE",
    "UNIVERSITY_MASTERS",
    "UNIVERSITY_PHD",
    "NON_FORMAL_EDUCATION"
  ], {
    errorMap: () => ({ message: "Please select a valid education level" }),
  }),

  image: z.any(),
  amcos: z.any(),
  ttbNumber: z.string().optional(),
  tinNumber: z.string().optional(),
  voterId: z.string().optional(),
  driversLicense: z.string().optional()
});

export type FormSchema = z.infer<typeof formSchema>;
