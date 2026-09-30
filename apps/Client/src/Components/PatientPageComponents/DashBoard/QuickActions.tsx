import {
  CalendarDays,
  Astroid,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router";
import QuickActionList from "../../PortalComponents/QuickActionList";

type Props = {
  onBookAppointment: () => void;
};

export default function QuickActions({
  onBookAppointment,
}: Props) {
  const navigate = useNavigate()
  return (
    <QuickActionList
      actions={[
        {
          label: "Book Appointment",
          icon: <CalendarDays color="#28574E" size={22} />,
          onClick: onBookAppointment,
        },
        {
          label: "Chat With AI",
          icon: <Astroid color="#28574E" size={22} />,
          onClick: () => navigate("/support"),
        },
        {
          label: "Medical Records",
          icon: <FileText color="#28574E" size={22} />,
          onClick: () => navigate("/underConstruction"),
        },
      ]}
    />
  );
}
