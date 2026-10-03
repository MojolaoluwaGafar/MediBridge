import type { ReactNode } from "react";
import { Building2, CalendarDays, FileUp, ShieldAlert, Stethoscope, UserPlus, Users } from "lucide-react";
import DashboardGreeting from "../PatientPageComponents/DashBoard/DashboardGreeting";
import EmptyState from "../PortalComponents/EmptyState";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { adminService } from "../../API/services/adminService";
import type { AuthUser } from "../../types/auth";
import { useAdminTab } from "./AdminTabs";

function Tile({ icon, label, value, detail, alert = false, onClick }: { icon: ReactNode; label: string; value: number; detail?: string; alert?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-[#D7D7D7] bg-white p-4 text-left transition hover:border-[#28574E]"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${alert ? "bg-[#FDECEA] text-[#8C1D18]" : "bg-[#E0F8F3] text-[#28574E]"}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-[#605E5E]">{label}</span>
        <span className="block fontOutfit text-2xl font-semibold">{value}</span>
        {detail && <span className="block truncate text-xs text-[#757575]">{detail}</span>}
      </span>
    </button>
  );
}

function Action({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-lg border border-[#E7E4E4] bg-white px-4 py-3 text-left hover:bg-gray-50">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E0F8F3] text-[#28574E]">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function Overview({ user }: { user: AuthUser | null }) {
  const { goToTab } = useAdminTab();
  const overview = useApiQuery(adminService.getOverview, "Couldn't load the overview");
  const data = overview.data;

  if (!data) {
    return overview.error ? (
      <EmptyState icon={<Building2 size={28} />} title="We couldn't load the overview" description={overview.error} />
    ) : (
      <p className="py-10 text-center text-[#707070]">Loading…</p>
    );
  }

  // Things an admin should act on, most important first.
  const todo: { text: string; tab: Parameters<typeof goToTab>[0]; tone: "red" | "amber" }[] = [];
  if (data.flags.urgent) todo.push({ text: `${data.flags.urgent} urgent safety alert${data.flags.urgent === 1 ? "" : "s"} waiting for review`, tab: "alerts", tone: "red" });
  if (data.departments.unstaffed.length)
    todo.push({ text: `No doctor is taking bookings in ${data.departments.unstaffed.join(", ")}`, tab: "doctors", tone: "amber" });
  if (data.doctors.total > data.doctors.withLogin)
    todo.push({ text: `${data.doctors.total - data.doctors.withLogin} doctor${data.doctors.total - data.doctors.withLogin === 1 ? " has" : "s have"} no login for the doctor portal`, tab: "doctors", tone: "amber" });
  if (data.patients.pending)
    todo.push({ text: `${data.patients.pending} registered patient${data.patients.pending === 1 ? " hasn't" : "s haven't"} activated their account yet`, tab: "patients", tone: "amber" });

  return (
    <div className="w-full space-y-8">
      <DashboardGreeting
        user={user}
        title={`Welcome, ${user?.firstname ?? "admin"}`}
        subtitle="Hospital-wide view of patients, doctors and appointments."
        aside={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <Tile icon={<Users size={22} />} label="Patients" value={data.patients.total} detail={`${data.patients.active} active · ${data.patients.pending} not activated`} onClick={() => goToTab("patients")} />
        <Tile icon={<Stethoscope size={22} />} label="Doctors" value={data.doctors.total} detail={`${data.doctors.accepting} taking bookings`} onClick={() => goToTab("doctors")} />
        <Tile icon={<CalendarDays size={22} />} label="Appointments today" value={data.appointments.today} detail={`${data.appointments.upcomingWeek} in the next 7 days · ${data.appointments.cancelledWeek} cancelled this week`} />
        <Tile icon={<ShieldAlert size={22} />} label="Open safety alerts" value={data.flags.open} detail={`${data.flags.urgent} urgent or emergency`} alert={data.flags.urgent > 0} onClick={() => goToTab("alerts")} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        <section className="rounded-xl border border-[#D7D7D7] bg-white xl:col-span-2">
          <h2 className="px-5 pt-5 fontOutfit text-lg font-medium">Needs your attention</h2>
          {todo.length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-sm text-[#757575]">Nothing right now. Departments are staffed, alerts reviewed and doctors have logins.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#E6E3E3] border-t border-[#E6E3E3]">
              {todo.map((item) => (
                <li key={item.text}>
                  <button type="button" onClick={() => goToTab(item.tab)} className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-gray-50">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.tone === "red" ? "bg-red-600" : "bg-amber-500"}`} />
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="fontOutfit text-lg font-medium">Quick actions</h2>
          <Action icon={<UserPlus size={20} />} label="Register a patient" onClick={() => goToTab("patients", { new: "1" })} />
          <Action icon={<FileUp size={20} />} label="Upload a document" onClick={() => goToTab("patients")} />
          <Action icon={<Stethoscope size={20} />} label="Add a doctor" onClick={() => goToTab("doctors", { new: "1" })} />
          <p className="text-xs text-[#757575]">{data.records.addedThisWeek} medical records added this week.</p>
        </section>
      </div>
    </div>
  );
}
