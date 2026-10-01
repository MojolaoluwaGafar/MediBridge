import type { IAppointment } from "./appointment";
import type { Activity } from "./activity";
import type { IDoctor } from "./doctor";
import type { IDepartment } from "./department";
import type { IMedicalRecord } from "./record";
import type {
  IConversationContact,
  IConversationMessage,
  IConversationSummary,
} from "./conversation";
import type { IAccountProfile } from "./account";

export interface IVerifyUserRes {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresAt : string;
  token: string;
}

export interface IVerifyCodeRes {
  success : boolean;
  message : string;
  user : {
    id : string;
    email : string;
    role : string;
  }
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

export interface IGetDepartmentRes {
  success?: boolean;
  department: IDepartment;
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

export interface IAiHistoryMessage {
  role: "user" | "assistant";
  content: string;
  level: UrgencyLevel | null;
  at: string;
}

export interface IAiHistoryResponse {
  sessionId: string | null;
  messages: IAiHistoryMessage[];
}

export interface IGetRecordsRes {
  success: boolean;
  records: IMedicalRecord[];
}

export interface IGetConversationsRes {
  success: boolean;
  conversations: IConversationSummary[];
}

export interface IGetConversationRes {
  success: boolean;
  contact: IConversationContact | null;
  messages: IConversationMessage[];
}

export interface ISendConversationMessageRes {
  success: boolean;
  message: IConversationMessage;
  safetyMessage?: string;
}

export interface IAccountRes {
  success: boolean;
  message?: string;
  profile: IAccountProfile;
}

export type ApiErrorResponse = { error?: string; message?: string };

