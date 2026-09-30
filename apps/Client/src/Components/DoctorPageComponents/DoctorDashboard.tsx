import { Astroid, CalendarDays, FileText, ShieldAlert, TriangleAlert, Users } from "lucide-react";
import DashboardGreeting from "../PatientPageComponents/DashBoard/DashboardGreeting";
import EmptyAppointmentState from "../PatientPageComponents/DashBoard/EmptyAppointmentState";
import StatCard from "../PortalComponents/StatCard";
import QuickActionList from "../PortalComponents/QuickActionList";
import ActivityList from "../PortalComponents/ActivityList";
import PatientAppointmentCard from "./PatientAppointmentCard";
import type { AuthUser } from "../../types/auth";
import type { DoctorAppointment, PortalActivity } from "../../types/portal";

type Props = {
  user: AuthUser | null;
  department: string;
  todaysAppointments: DoctorAppointment[];
  stats: {
    patientsThisWeek: number;
    urgentThisWeek: number;
    recordsShared: number;
  };
  activities: PortalActivity[];
  onViewPatient?: (appointment: DoctorAppointment) => void;
  onNavigate?: (tab: string) => void;
};

export default function DoctorDashboard({
  user,
  department,
  todaysAppointments,
  stats,
  activities,
  onViewPatient,
  onNavigate,
}: Props) {
  const upcoming = todaysAppointments.filter((a) => a.status === "confirmed");
  const flagged = upcoming.filter((a) => a.urgency && a.urgency.level !== "routine");
  const completed = todaysAppointments.filter((a) => a.status === "completed").length;

  const subtitle = upcoming.length
    ? `${department} · You have ${upcoming.length} appointment${upcoming.length === 1 ? "" : "s"} left today${
        flagged.length ? `, ${flagged.length} marked urgent` : ""
      }.`
    : `${department} · You have no more appointments today.`;

  return (
    <div className="w-full px-4 md:px-0">
      <DashboardGreeting
        user={user}
        title={`Hello, Dr. ${user?.firstname ?? ""} ${user?.lastname ?? ""}`}
        subtitle={subtitle}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 pt-8">
        <StatCard
          label="Today's appointments"
          value={todaysAppointments.length}
          icon={<CalendarDays size={22} />}
          note={`${completed} completed · ${upcoming.length} remaining`}
        />
        <StatCard
          label="Marked urgent this week"
          value={stats.urgentThisWeek}
          icon={<TriangleAlert size={22} />}
          note={stats.urgentThisWeek ? "Check the reasons before each visit" : "Nothing urgent"}
          noteTone={stats.urgentThisWeek ? "warning" : "neutral"}
        />
        <StatCard
          label="Patients this week"
          value={stats.patientsThisWeek}
          icon={<Users size={22} />}
        />
        <StatCard
          label="Records shared with you"
          value={stats.recordsShared}
          icon={<FileText size={22} />}
          note="For this week's visits"
        />
      </div>

      <div className="flex flex-col w-full lg:flex-row justify-between gap-6 lg:gap-10 py-8">
        <div className="w-full xl:w-2/3 flex flex-col gap-4 fontOutfit">
          <p className="text-xl sm:text-2xl font-medium">Today's Schedule</p>
          {upcoming.length ? (
            <div className="space-y-6">
              {upcoming.map((appointment) => (
                <PatientAppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onViewPatient={onViewPatient}
                />
              ))}
            </div>
          ) : (
            <EmptyAppointmentState
              title="No more appointments today"
              description="Confirmed appointments for today will appear here."
              showButton={false}
            />
          )}
        </div>

        <div className="w-full lg:max-w-[391px] lg:self-start">
          <QuickActionList
            actions={[
              { label: "View Full Schedule", icon: <CalendarDays size={22} />, onClick: () => onNavigate?.("appointments") },
              { label: "Ask the AI Assistant", icon: <Astroid size={22} />, onClick: () => onNavigate?.("assistant") },
              { label: "Review AI Safety Flags", icon: <ShieldAlert size={22} />, onClick: () => onNavigate?.("flags") },
            ]}
          />
        </div>
      </div>

      <h2 className="py-3 text-lg md:text-[24px] font-medium fontOutfit">
        Recent Activities
      </h2>

      <div className="border border-[#D7D7D7] rounded-xl p-4">
        <ActivityList activities={activities} />
      </div>
    </div>
  );
}
