import { z } from "zod";
import { isDateString, parseTimeLabel } from "../Utils/appointmentTime";

// Shape checks only. Whether the doctor actually works then, and whether the
// slot is free, is checked in appointmentService.
const date = z
  .string()
  .min(1, "Date is required")
  .refine(isDateString, "Date must be a real date in YYYY-MM-DD format");

const time = z
  .string()
  .min(1, "Time is required")
  .refine((value) => parseTimeLabel(value) !== null, "Time must look like 9:30 AM");

export const BookingSchema = z.object({
  department: z.string().min(1, "Department is required"),
  doctor: z.string().min(1, "Doctor is required"),
  date,
  time,
  reason: z.string().trim().min(1, "Reason is required").max(1000, "Please keep the reason under 1000 characters"),
  shareRecords: z.boolean().optional(),
});

export type BookingPayload = z.infer<typeof BookingSchema>;

export const RescheduleSchema = z.object({ date, time });

export type ReschedulePayload = z.infer<typeof RescheduleSchema>;
