export interface IAccountProfile {
  id: string;
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  img: string | null;
}

export interface IAccountRes {
  success: boolean;
  message?: string;
  profile: IAccountProfile;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
