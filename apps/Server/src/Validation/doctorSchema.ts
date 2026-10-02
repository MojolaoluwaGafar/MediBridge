import { z } from "zod";
import { isDateString, parseTimeLabel, SLOT_MINUTES } from "../Utils/appointmentTime";
import { MAX_NOTE_LENGTH } from "../Models/VisitNote";

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

// "9:00 AM" or "09:00"; stored as "9:00 AM" by the service.
const timeLabel = z
  .string()
  .trim()
  .refine((value) => parseTimeLabel(value) !== null, "Times must look like 9:30 AM");

const workingWindow = z
  .object({ day: z.enum(WEEK_DAYS, "Day must be a weekday name, like Monday"), start: timeLabel, end: timeLabel })
  .refine(
    (w) => (parseTimeLabel(w.end) ?? 0) - (parseTimeLabel(w.start) ?? 0) >= SLOT_MINUTES,
    `Each block must end at least ${SLOT_MINUTES} minutes after it starts`
  );

// Weekly hours. Blocks on the same day must not overlap, so every slot is
// offered once.
export const AvailabilitySchema = z
  .object({
    availability: z.boolean(),
    availableTime: z.array(workingWindow).max(28, "That's more blocks than a week can hold"),
  })
  .superRefine((value, ctx) => {
    for (const day of WEEK_DAYS) {
      const windows = value.availableTime
        .map((w, index) => ({ index, from: parseTimeLabel(w.start)!, to: parseTimeLabel(w.end)!, day: w.day }))
        .filter((w) => w.day === day)
        .sort((a, b) => a.from - b.from);
      for (let i = 1; i < windows.length; i++) {
        if (windows[i].from < windows[i - 1].to) {
          ctx.addIssue({
            code: "custom",
            path: ["availableTime", windows[i].index],
            message: `Two blocks on ${day} overlap. Please adjust the times.`,
          });
        }
      }
    }
  });

export type AvailabilityInput = z.infer<typeof AvailabilitySchema>;

export const DoctorCancelSchema = z.object({
  reason: z.string().trim().max(500, "Please keep the reason under 500 characters").optional().default(""),
});

export const VisitNoteSchema = z.object({
  body: z.string().trim().min(1, "Write something before saving").max(MAX_NOTE_LENGTH, `Notes can be up to ${MAX_NOTE_LENGTH} characters`),
  appointmentId: z.string().optional(),
});

export const APPOINTMENT_VIEWS = ["upcoming", "today", "completed", "cancelled", "all"] as const;

export const AppointmentListQuery = z.object({
  view: z.enum(APPOINTMENT_VIEWS).optional().default("upcoming"),
  date: z.string().refine(isDateString, "Date must be YYYY-MM-DD").optional(),
});
