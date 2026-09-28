import { z } from "zod";

export const BookingSchema = z.object({
  department: z.string().min(1, "Department is required"),
  doctor: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().min(1, "Reason is required"),
  shareRecords: z.boolean().optional(),
});

export type BookingPayload = z.infer<typeof BookingSchema>;
