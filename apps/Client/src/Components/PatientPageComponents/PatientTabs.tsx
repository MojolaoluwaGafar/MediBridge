import {
  LayoutDashboard,
  CalendarDays,
  Hospital,
  FileText,
  MessageCircleMore,
  Astroid,
  Settings,
} from "lucide-react";

const ICON_SIZE = 20;

export const patientTabs = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={ICON_SIZE} />,
  },
  {
    key: "appointments",
    label: "Appointments",
    icon: <CalendarDays size={ICON_SIZE} />,
  },
  {
    key: "departments",
    label: "Departments",
    icon: <Hospital size={ICON_SIZE} />,
  },
  {
    key: "medRecords",
    label: "Medical Records",
    icon: <FileText size={ICON_SIZE} />,
  },
  {
    key: "messages",
    label: "Messages",
    icon: <MessageCircleMore size={ICON_SIZE} />,
  },
  {
    key: "aiSupport",
    label: "AI Support",
    icon: <Astroid size={ICON_SIZE} />,
  },
  {
    key: "settings",
    label: "Account Settings",
    icon: <Settings size={ICON_SIZE} />,
  },
] as const;

export type PatientTabKey = (typeof patientTabs)[number]["key"];

export const DEFAULT_PATIENT_TAB: PatientTabKey = "dashboard";

export const isPatientTab = (value: string | null): value is PatientTabKey =>
  patientTabs.some((tab) => tab.key === value);

// A link to a portal tab, e.g. patientTabLink("messages", { contact: doctorId }).
// The active tab is kept in the URL so these links, refresh and back all work.
export const patientTabLink = (tab: PatientTabKey, params: Record<string, string> = {}) => {
  const query = new URLSearchParams(tab === DEFAULT_PATIENT_TAB ? params : { tab, ...params });
  const search = query.toString();
  return `/patientDashboard${search ? `?${search}` : ""}`;
};
