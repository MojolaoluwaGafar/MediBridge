import { useState } from "react";
import Tabs from "../PatientPageComponents/Appointments/Tabs";
import EmptyAppointmentState from "../PatientPageComponents/DashBoard/EmptyAppointmentState";
import PatientAppointmentCard from "./PatientAppointmentCard";
import type { DoctorAppointment } from "../../types/portal";

type Props = {
  appointments: DoctorAppointment[];
  today: string;
  onViewPatient?: (appointment: DoctorAppointment) => void;
  initialTab?: string;
};

const EMPTY_TEXT: Record<string, string> = {
  Today: "You have no appointments today.",
  Upcoming: "New bookings from patients will appear here.",
  Past: "Completed and cancelled appointments will appear here.",
};

export default function DoctorAppointments({ appointments, today, onViewPatient, initialTab = "Today" }: Props) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const groups: Record<string, DoctorAppointment[]> = {
    Today: appointments.filter((a) => a.date === today && a.status !== "cancelled"),
    Upcoming: appointments.filter((a) => a.date > today && a.status !== "cancelled"),
    Past: appointments.filter((a) => a.date < today || a.status === "cancelled"),
  };

  // Urgent and emergency appointments first, then by date and time.
  const rank = { emergency: 0, urgent: 1, routine: 2 };
  const visible = [...groups[activeTab]].sort(
    (a, b) =>
      rank[a.urgency?.level ?? "routine"] - rank[b.urgency?.level ?? "routine"] ||
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  return (
    <div className="w-full">
      <div>
        <h1 className="fontOutfit font-semibold text-2xl">Appointments</h1>
        <p className="text-[#707070] text-base font-light">
          Your schedule, with urgent visits first.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <Tabs
          tabs={Object.keys(groups).map((key) => ({ key, label: key, appointment: groups[key].length }))}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="mt-8">
        {visible.length === 0 ? (
          <EmptyAppointmentState
            title={`No ${activeTab.toLowerCase()} appointments`}
            description={EMPTY_TEXT[activeTab]}
            showButton={false}
          />
        ) : (
          <div className="space-y-6">
            {visible.map((appointment) => (
              <PatientAppointmentCard
                key={appointment._id}
                appointment={appointment}
                onViewPatient={onViewPatient}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
