// Shapes returned by /api/doctor/*. Keep in step with
// apps/Server/src/Services/doctorPortalService.ts.
import type { IAppointment } from "./appointment";
import type { IMedicalRecord } from "./record";
import type { UrgencyLevel } from "./apiReqRes";

export interface IWorkingWindow {
  day: string;
  start: string;
  end: string;
}

export interface IDoctorProfile {
  _id: string;
  docName: string;
  docImg: string;
  department: string;
  YOE: number;
  about: string;
  gender?: string;
  availability: boolean;
  availableTime: IWorkingWindow[];
  slotMinutes: number;
}

export interface IPatientSummary {
  id: string;
  userId: string;
  firstname: string;
  lastname: string;
  img: string | null;
}

export interface IDoctorAppointment {
  _id: string;
  date: string;
  time: string;
  reason: string;
  status: IAppointment["status"];
  department: string;
  shareRecords: boolean;
  urgency: IAppointment["urgency"] | null;
  createdAt: string;
  patient: IPatientSummary | null;
}

export interface IAttentionFlag {
  _id: string;
  source: "chat" | "booking" | "message";
  level: UrgencyLevel;
  reason: string;
  message: string;
  flaggedAt: string;
  patient: IPatientSummary | null;
  appointment: { _id: string; date: string; time: string } | null;
}

export interface IDoctorActivity {
  _id: string;
  type: "confirmed" | "rescheduled" | "cancelled";
  actor: "patient" | "doctor";
  timestamp: string;
  patient: IPatientSummary | null;
  date: string | null;
  time: string | null;
}

export interface IDoctorDashboard {
  today: string;
  stats: {
    today: number;
    remainingToday: number;
    upcomingThisWeek: number;
    patientsThisWeek: number;
    completedThisWeek: number;
    needsAttention: number;
  };
  schedule: IDoctorAppointment[];
  nextAppointmentId: string | null;
  needsAttention: IAttentionFlag[];
  activity: IDoctorActivity[];
}

export type AppointmentView = "upcoming" | "today" | "completed" | "cancelled" | "all";

export interface IDoctorPatientRow extends IPatientSummary {
  visits: number;
  lastVisit: string | null;
  nextVisit: string | null;
}

export interface IVisitNote {
  _id: string;
  body: string;
  appointmentId: string | null;
  createdAt: string;
}

export type ISharedRecordSummary = Omit<IMedicalRecord, "sections">;

export interface IDoctorPatientProfile {
  patient: IPatientSummary & { email: string; phone: string };
  nextAppointment: IDoctorAppointment | null;
  appointments: IDoctorAppointment[];
  recordsShared: boolean;
  records: ISharedRecordSummary[];
  notes: IVisitNote[];
}

export interface IAvailabilityPayload {
  availability: boolean;
  availableTime: IWorkingWindow[];
}

export interface IAvailabilityRes {
  success: boolean;
  message: string;
  doctor: IDoctorProfile;
  outsideHours: IDoctorAppointment[];
}
