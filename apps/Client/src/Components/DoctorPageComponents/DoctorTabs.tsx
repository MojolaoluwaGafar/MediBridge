import { LayoutDashboard, CalendarDays, Users, Clock, MessageCircleMore, Settings } from "lucide-react";
import { usePortalTab } from "../../Hooks/Portal/usePortalTab";

export const doctorTabs = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { key: "appointments", label: "Appointments", icon: <CalendarDays /> },
  { key: "patients", label: "Patients", icon: <Users /> },
  { key: "availability", label: "Availability", icon: <Clock /> },
  { key: "messages", label: "Messages", icon: <MessageCircleMore /> },
  { key: "settings", label: "Account Settings", icon: <Settings /> },
] as const;

export type DoctorTabKey = (typeof doctorTabs)[number]["key"];

export const isDoctorTab = (key: string | null): key is DoctorTabKey => doctorTabs.some((tab) => tab.key === key);

export const DOCTOR_TAB_TITLES: Record<DoctorTabKey, string> = {
  dashboard: "Dashboard",
  appointments: "Appointments",
  patients: "Patients",
  availability: "Availability",
  messages: "Messages",
  settings: "Account Settings",
};

// ?tab=patients&patient=<id> opens that patient's profile; ?tab=messages&patient=<id>
// opens the conversation with them.
export function useDoctorTab() {
  return usePortalTab<DoctorTabKey>(isDoctorTab, "dashboard");
}
