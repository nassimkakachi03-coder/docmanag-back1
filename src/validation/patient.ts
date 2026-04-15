import { z } from "zod";

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be valid"),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    dateOfBirth: z.string().refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d < new Date();
    }, "Date of birth must be valid and in the past"),
    gender: z.enum(["Male", "Female", ""]).optional(),
    address: z.string().optional(),
    medicalHistory: z.string().optional(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .optional(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .optional(),
    phone: z.string().min(10, "Phone number must be valid").optional(),
    email: z.string().email("Invalid email address").optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["Male", "Female", ""]).optional(),
    address: z.string().optional(),
    medicalHistory: z.string().optional(),
  }),
});
