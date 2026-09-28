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
  appointment: IAppointment
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

export interface IAiChatPayload {
  message: string;
}

export interface IAiChatResponse {
  reply: string;
}


export type ApiErrorResponse = { error?: string; message?: string };

