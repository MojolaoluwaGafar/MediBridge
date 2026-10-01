export interface IAccountProfile {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  img: string | null;
  patientId: string;
  phone: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
