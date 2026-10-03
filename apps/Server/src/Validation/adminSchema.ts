import { z } from "zod";
import { normalizePhone } from "../Utils/phone";
import { isDateString } from "../Utils/appointmentTime";
import { AvailabilitySchema } from "./doctorSchema";

// Admin portal input. Shape checks only; uniqueness and existence are
// checked in adminService.

const name = (label: string) => z.string().trim().min(1, `${label} is required`).max(60, `${label} can be up to 60 characters`);
const email = z.string().trim().toLowerCase().email("Enter a valid email address");
const phone = z
  .string()
  .trim()
  .refine((value) => normalizePhone(value) !== null, "Enter a valid phone number, e.g. 0803 123 4567");
// Hospital IDs: letters, digits and dashes. Left empty, one is generated.
const userId = z
  .string()
  .trim()
  .max(20, "IDs can be up to 20 characters")
  .regex(/^[A-Za-z0-9-]*$/, "Use only letters, numbers and dashes")
  .optional()
  .default("");

// A person who will activate their own account (patients, and the logins
// of doctors and admins).
export const PersonSchema = z.object({
  userId,
  firstname: name("First name"),
  lastname: name("Last name"),
  email,
  phone,
});
export type PersonInput = z.infer<typeof PersonSchema>;

export const UpdatePersonSchema = PersonSchema.omit({ userId: true }).partial();
export type UpdatePersonInput = z.infer<typeof UpdatePersonSchema>;

export const ListQuery = z.object({
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
});

export const DoctorProfileSchema = z.object({
  docName: z.string().trim().min(3, "Enter the doctor's name").max(80),
  department: z.string().trim().min(1, "Choose a department"),
  YOE: z.coerce.number().int().min(0, "Years of experience can't be negative").max(70),
  gender: z.enum(["male", "female"], "Choose a gender"),
  about: z.string().trim().max(1000, "Keep the bio under 1000 characters").optional().default(""),
  availability: z.boolean().optional().default(true),
  availableTime: AvailabilitySchema.shape.availableTime.optional(),
});
export type DoctorProfileInput = z.infer<typeof DoctorProfileSchema>;
export const UpdateDoctorProfileSchema = DoctorProfileSchema.partial();

export const DEPARTMENT_ICONS = ["Heart", "Brain", "Eye", "Bone", "Baby", "Venus", "Stethoscope", "Ambulance", "Activity", "ShieldPlus", "Smile", "Tooth", "FirstAid", "MentalHealth"] as const;

export const DepartmentSchema = z.object({
  field: z.string().trim().min(2, "Enter the department's name").max(60),
  category: z.string().trim().min(2, "Enter a category, e.g. Medical").max(40),
  summary: z.string().trim().min(10, "Write a one-line summary").max(300),
  icon: z.enum(DEPARTMENT_ICONS, "Choose an icon"),
  iconBgColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #FFF4F3").optional().default("#E0F8F3"),
  iconColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #28574E").optional().default("#28574E"),
  overview: z.string().trim().min(10, "Write an overview").max(2000),
  services: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
});
export type DepartmentInput = z.infer<typeof DepartmentSchema>;
export const UpdateDepartmentSchema = DepartmentSchema.partial();

// Documents staff upload. Doctors write consultation notes and
// prescriptions themselves, in the doctor portal.
export const UPLOAD_RECORD_TYPES = ["lab_result", "imaging", "discharge_summary"] as const;

// Sent as multipart form fields next to the file, so everything is a string.
export const UploadRecordSchema = z.object({
  type: z.enum(UPLOAD_RECORD_TYPES, "Choose lab result, imaging report or discharge summary"),
  title: z.string().trim().min(1, "Give the document a title").max(150),
  department: z.string().trim().min(1, "Choose a department").max(60),
  visitDate: z.string().refine(isDateString, "Enter the date of the test or visit"),
  summary: z.string().trim().max(2000).optional().default(""),
});
export type UploadRecordInput = z.infer<typeof UploadRecordSchema>;
