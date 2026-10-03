import { Building2, LayoutDashboard, Settings, ShieldAlert, Stethoscope, UserCog, Users } from "lucide-react";
import { usePortalTab } from "../../Hooks/Portal/usePortalTab";

export const adminTabs = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard /> },
  { key: "patients", label: "Patients", icon: <Users /> },
  { key: "doctors", label: "Doctors", icon: <Stethoscope /> },
  { key: "departments", label: "Departments", icon: <Building2 /> },
  { key: "alerts", label: "Safety alerts", icon: <ShieldAlert /> },
  { key: "staff", label: "Admin accounts", icon: <UserCog /> },
  { key: "settings", label: "Account Settings", icon: <Settings /> },
] as const;

export type AdminTabKey = (typeof adminTabs)[number]["key"];

export const isAdminTab = (key: string | null): key is AdminTabKey => adminTabs.some((tab) => tab.key === key);

// ?tab=patients&patient=<id> opens that patient.
export function useAdminTab() {
  return usePortalTab<AdminTabKey>(isAdminTab, "overview");
}
