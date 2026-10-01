import type { IAppointment } from "./appointment";
import type { Activity } from "./activity";
import type { IDoctor } from "./doctor";
import type { IDepartment } from "./department";

export interface IVerifyUserRes {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresAt : string;
  // Masked number the code was also texted to (e.g. "+234 *** *** 4567"),
  // or null when it went by email only.
  phone? : string | null;
}

export interface IVerifyCodeRes {
  success : boolean;
  message : string;
  user : {
    id : string;
    email : string;
    role : string;
  }
  // One-time ticket that allows setting the password (valid 15 minutes).
  passwordToken : string;
}

export interface ISetPasswordRes{
  success : boolean;
  message : string;
  user : {
    id : string;
    email : string;
    firstname : string;
    lastname : string;
    role : string;
  },
  token : string;
}

export interface CodeReqResponse {
  success: boolean;
  message: string;
  email : string;
  phone? : string | null;
  expiresAt : string;
}

export interface ILoginRes {
  success : boolean;
  message : string;
  user : {
    id : string;
    firstname : string;
    lastname : string;
    email : string;
    role : string;
  },
  token : string;
}

export interface IGetDoctorsRes {
  success: boolean;
  doctors: IDoctor[];
}

export interface IGetDoctorRes {
  success: boolean;
  doctor: IDoctor;
}

export interface IDoctorSlot {
  time: string;
  available: boolean;
  // Why it can't be booked: someone else has it, or it has already started.
  reason?: "booked" | "past";
}

export interface IDoctorSlotsRes {
  success: boolean;
  date: string;
  day: string;
  slotMinutes: number;
  slots: IDoctorSlot[];
}

export interface IBookAppointmentPayload {
  doctor: string;
  department: string;
  date : string;
  time: string;
  reason: string;
  shareRecords?: boolean;
}

export interface IBookAppointmentRes {
  success: boolean;
  message: string;
  appointment: IAppointment;
  safetyMessage?: string;
}

export interface IGetAppointmentsRes {
    success: boolean;
    appointments: IAppointment[];
}
export interface IActivitiesRes {
  success: boolean;
  activities: Activity[];
}

export interface IRescheduleAppointmentPayload {
  id: string;
  date: string;
  time: string;
}

export interface IRescheduleAppointmentRes {
  success: boolean;
  message: string;
  appointment: IAppointment;
}

export interface IGetDepartmentsRes {
  departments: IDepartment[];
}


export type UrgencyLevel = "routine" | "urgent" | "emergency";

export interface IAiChatPayload {
  message: string;
  sessionId?: string | null;
}

export interface IAiChatResponse {
  reply: string;
  sessionId: string | null;
  urgency: UrgencyLevel;
}

export interface IAiChatSessionSummary {
  sessionId: string;
  title: string;
  updatedAt: string;
}

export interface IAiChatSessionsRes {
  success: boolean;
  sessions: IAiChatSessionSummary[];
}

export interface IAiChatSessionRes {
  success: boolean;
  sessionId: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    level: UrgencyLevel | null;
    at: string;
  }[];
}


export type ApiErrorResponse = { error?: string; message?: string };

