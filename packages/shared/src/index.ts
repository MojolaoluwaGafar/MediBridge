// Types shared by apps/web and apps/api. Keep this package type-only for now:
// the API runs as CommonJS through ts-node and does not build this package, so
// import from it with `import type` only.

export type UserRole = "user" | "doctor" | "admin";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type ActivityType = "confirmed" | "rescheduled" | "cancelled";

export interface DoctorAvailability {
  day: string;
  start: string;
  end: string;
}
