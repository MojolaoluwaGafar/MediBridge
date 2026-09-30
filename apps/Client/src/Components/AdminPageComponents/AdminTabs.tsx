import {
  LayoutDashboard,
  ShieldAlert,
  Stethoscope,
  Users,
  Hospital,
} from "lucide-react";

export const adminTabs = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { key: "flags", label: "AI Safety Flags", icon: <ShieldAlert /> },
  { key: "doctors", label: "Doctors", icon: <Stethoscope /> },
  { key: "patients", label: "Patients", icon: <Users /> },
  { key: "departments", label: "Departments", icon: <Hospital /> },
];
