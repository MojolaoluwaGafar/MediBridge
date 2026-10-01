// Where each role lands after signing in, and the only portal it may open.
// Roles match the server: "user" is a patient.
export type UserRole = "user" | "doctor" | "admin";

export const ROLE_HOME: Record<UserRole, string> = {
  user: "/patientDashboard",
  doctor: "/doctorDashboard",
  admin: "/adminDashboard",
};

export const homePathFor = (role: string | undefined | null): string =>
  ROLE_HOME[role as UserRole] ?? "/login";
