import type { UrgencyLevel } from "./apiReqRes";

// Shapes used by the doctor and admin portals. They follow the server models:
// Appointment (with urgency), User (patients), Doctor and FlaggedMessage.

export interface PortalPatient {
  _id: string;
  firstname: string;
  lastname: string;
  patientId: string;
  email?: string;
  phone?: string;
}

export type DoctorAppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface DoctorAppointment {
  _id: string;
  patient: PortalPatient;
  department: string;
  date: string;
  time: string;
  reason: string;
  status: DoctorAppointmentStatus;
  shareRecords?: boolean;
  urgency?: {
    level: UrgencyLevel;
    reason: string;
    source: "keyword" | "ai" | "keyword+ai" | "doctor";
  };
}

export type FlagCategory = "none" | "self_harm" | "medical" | "harm_to_others";

export interface SafetyFlag {
  _id: string;
  source: "chat" | "booking";
  message: string;
  reason: string;
  level: UrgencyLevel;
  category: FlagCategory;
  status: "new" | "reviewed";
  flaggedAt: string;
  patient?: PortalPatient | null;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface PortalDoctor {
  _id: string;
  docName: string;
  department: string;
  docImg?: string;
  availability: boolean;
  // Whether a login account is linked (Doctor.userId on the server).
  accountEmail?: string | null;
  appointmentsThisWeek: number;
}

export interface PortalActivity {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "confirmed" | "rescheduled" | "cancelled" | "flag" | "record" | "note";
}
