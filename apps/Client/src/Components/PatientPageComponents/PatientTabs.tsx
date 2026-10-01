import {
  LayoutDashboard,
  CalendarDays,
  Hospital,
  FileText,
  MessageCircleMore,
  Astroid,
  Settings,
} from "lucide-react";

export const patientTabs = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard />,
  },
   {
      key: "appointments",
      label: "Appointments",
      icon: <CalendarDays />,
    },
    {
      key: "departments",
      label: "Departments",
      icon: <Hospital />,
    },
    {
      key: "medRecords",
      label: "Medical Records",
      icon: <FileText />,
    },
    {
      key: "messages",
      label: "Messages",
      icon: <MessageCircleMore />,
    },
    {
      key: "aiSupport",
      label: "AI Support",
      icon: <Astroid />,
    },
    {
      key: "settings",
      label: "Account Settings",
      icon: <Settings />,
    },
];