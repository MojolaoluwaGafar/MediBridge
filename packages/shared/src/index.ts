// Types shared by apps/Client and apps/Server. Keep this package type-only for now:
// the Server runs as CommonJS through ts-node and does not build this package, so
// import from it with `import type` only.

export type UserRole = "user" | "doctor" | "admin";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type ActivityType = "confirmed" | "rescheduled" | "cancelled";

export interface DoctorAvailability {
  day: string;
  start: string;
  end: string;
}
