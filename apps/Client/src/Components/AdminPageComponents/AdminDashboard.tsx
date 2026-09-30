import { CalendarDays, Link2, ShieldAlert, Stethoscope, UserPlus, Users } from "lucide-react";
import DashboardGreeting from "../PatientPageComponents/DashBoard/DashboardGreeting";
import StatCard from "../PortalComponents/StatCard";
import QuickActionList from "../PortalComponents/QuickActionList";
import ActivityList from "../PortalComponents/ActivityList";
import FlagCard from "./FlagCard";
import type { AuthUser } from "../../types/auth";
import type { PortalActivity, SafetyFlag } from "../../types/portal";

type Props = {
  user: AuthUser | null;
  stats: {
    patients: number;
    doctors: number;
    doctorsNotLinked: number;
    appointmentsThisWeek: number;
  };
  newFlags: SafetyFlag[];
  activities: PortalActivity[];
  onReviewFlag?: (flag: SafetyFlag) => void;
  onNavigate?: (tab: string) => void;
};

export default function AdminDashboard({ user, stats, newFlags, activities, onReviewFlag, onNavigate }: Props) {
  const emergencies = newFlags.filter((f) => f.level === "emergency").length;

  return (
    <div className="w-full px-4 md:px-0">
      <DashboardGreeting
        user={user}
        subtitle={
          newFlags.length
            ? `${newFlags.length} AI safety flag${newFlags.length === 1 ? "" : "s"} waiting for review.`
            : "No AI safety flags waiting for review."
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 pt-8">
        <StatCard
          label="New AI safety flags"
          value={newFlags.length}
          icon={<ShieldAlert size={22} />}
          note={emergencies ? `${emergencies} emergency` : "None urgent"}
          noteTone={emergencies ? "warning" : "neutral"}
        />
        <StatCard
          label="Appointments this week"
          value={stats.appointmentsThisWeek}
          icon={<CalendarDays size={22} />}
        />
        <StatCard label="Patients" value={stats.patients} icon={<Users size={22} />} />
        <StatCard
          label="Doctors"
          value={stats.doctors}
          icon={<Stethoscope size={22} />}
          note={stats.doctorsNotLinked ? `${stats.doctorsNotLinked} without a login` : "All have logins"}
          noteTone={stats.doctorsNotLinked ? "warning" : "good"}
        />
      </div>

      <div className="flex flex-col w-full lg:flex-row justify-between gap-6 lg:gap-10 py-8">
        <div className="w-full xl:w-2/3 flex flex-col gap-4 fontOutfit">
          <div className="flex items-center justify-between">
            <p className="text-xl sm:text-2xl font-medium">Needs Review</p>
            <button
              type="button"
              onClick={() => onNavigate?.("flags")}
              className="text-[16px] font-medium text-[#28574E]"
            >
              View all flags
            </button>
          </div>
          <div className="space-y-6">
            {newFlags.slice(0, 2).map((flag) => (
              <FlagCard key={flag._id} flag={flag} onReview={onReviewFlag} compact />
            ))}
          </div>
        </div>

        <div className="w-full lg:max-w-[391px] lg:self-start">
          <QuickActionList
            actions={[
              { label: "Review AI Safety Flags", icon: <ShieldAlert size={22} />, onClick: () => onNavigate?.("flags") },
              { label: "Link Doctor Accounts", icon: <Link2 size={22} />, onClick: () => onNavigate?.("doctors") },
              { label: "Add Patient", icon: <UserPlus size={22} />, onClick: () => onNavigate?.("patients") },
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
