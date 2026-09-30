import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Astroid,
  ShieldAlert,
} from "lucide-react";

export const doctorTabs = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { key: "appointments", label: "Appointments", icon: <CalendarDays /> },
  { key: "patients", label: "My Patients", icon: <Users /> },
  { key: "assistant", label: "AI Assistant", icon: <Astroid /> },
  { key: "flags", label: "AI Safety Flags", icon: <ShieldAlert /> },
];
