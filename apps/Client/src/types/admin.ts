// Shapes returned by /api/admin/*. Keep in step with
// apps/Server/src/Services/adminService.ts.
import type { IMedicalRecord } from "./record";
import type { IWorkingWindow } from "./doctorPortal";

export interface IAdminOverview {
  patients: { total: number; active: number; pending: number };
  doctors: { total: number; withLogin: number; accepting: number };
  departments: { total: number; unstaffed: string[] };
  appointments: { today: number; upcomingWeek: number; cancelledWeek: number };
  flags: { open: number; urgent: number };
  records: { addedThisWeek: number };
}

export type PersonRole = "user" | "doctor" | "admin";

export interface IPerson {
  id: string;
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: PersonRole;
  // They have set a password and can sign in.
  activated: boolean;
  img: string | null;
  createdAt: string | null;
}

export interface IPersonPayload {
  userId?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface IPeoplePage {
  people: IPerson[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IAdminAppointment {
  _id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  department: string;
  doctor: string | null;
  urgency: "routine" | "urgent" | "emergency";
}

export type IAdminRecord = Omit<IMedicalRecord, "sections"> & { uploadedByStaff: boolean };

export interface IAdminPatientDetail {
  patient: IPerson;
  appointments: IAdminAppointment[];
  records: IAdminRecord[];
}

export type UploadRecordType = "lab_result" | "imaging" | "discharge_summary";

export interface IAdminDoctor {
  _id: string;
  docName: string;
  docImg: string;
  department: string;
  YOE: number;
  gender: "male" | "female";
  about: string;
  availability: boolean;
  availableTime: IWorkingWindow[];
  upcomingAppointments: number;
  account: { id: string; userId: string; email: string; activated: boolean } | null;
}

export interface IDoctorPayload {
  docName: string;
  department: string;
  YOE: number;
  gender: "male" | "female";
  about: string;
  availability: boolean;
  availableTime?: IWorkingWindow[];
}

export interface IAdminDepartment {
  _id: string;
  field: string;
  category: string;
  summary: string;
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
  details?: { overview?: string; services?: string[]; image?: string };
  doctors: number;
  acceptingDoctors: number;
}

export interface IDepartmentPayload {
  field: string;
  category: string;
  summary: string;
  icon: string;
  overview: string;
  services: string[];
}

export interface IFlag {
  _id: string;
  source: "chat" | "booking" | "message";
  message: string;
  reason: string;
  level: "routine" | "urgent" | "emergency";
  category: string;
  status: "new" | "reviewed";
  flaggedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  userId?: { _id: string; FirstName: string; LastName: string; UserId: string } | null;
  reviewedBy?: { FirstName: string; LastName: string } | null;
}
