import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import Avatar from "../../PortalComponents/Avatar";
import Button from "../../Button";
import Tabs from "../../PatientPageComponents/Appointments/Tabs";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { useAppointmentActions } from "../../../Hooks/Doctor/useAppointmentActions";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import type { IDoctorAppointment } from "../../../types/doctorPortal";
import { todayDateString } from "../../../utils/formatDate";
import { useDoctorTab } from "../DoctorTabs";
import { RecordsSharedChip, StatusChip, UrgencyChip } from "../shared";
import { dayHeading, hasStarted, minutesOf, patientName } from "../../../utils/doctorFormat";

type View = "Upcoming" | "Today" | "Completed" | "Cancelled";

const loadAll = () => doctorPortalService.getAppointments("all");

const byDateTime = (a: IDoctorAppointment, b: IDoctorAppointment) =>
  a.date === b.date ? minutesOf(a.time) - minutesOf(b.time) : a.date < b.date ? -1 : 1;

function AppointmentRow({
  appointment,
  today,
  busy,
  onOpenPatient,
  onMessage,
  onComplete,
  onCancel,
}: {
  appointment: IDoctorAppointment;
  today: string;
  busy: boolean;
  onOpenPatient: () => void;
  onMessage: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const open = appointment.status === "confirmed";
  const canComplete = open && hasStarted(appointment, today);
  const canCancel = open && appointment.date >= today;

  return (
    <li className="flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="w-16 shrink-0 pt-0.5 fontOutfit text-sm font-medium">{appointment.time}</span>
        <Avatar name={patientName(appointment)} image={appointment.patient?.img} />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenPatient}
            disabled={!appointment.patient}
            className="max-w-full truncate text-left fontOutfit font-medium hover:underline disabled:no-underline"
          >
            {patientName(appointment)}
          </button>
          {appointment.patient && <p className="text-xs text-[#757575]">ID {appointment.patient.userId}</p>}
          <p className="mt-1 text-sm text-[#605E5E] wrap-break-word">{appointment.reason}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <StatusChip status={appointment.status} />
            <UrgencyChip level={appointment.urgency?.level} />
            {appointment.shareRecords && <RecordsSharedChip />}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-[4.75rem] md:shrink-0 md:pl-0">
        {canComplete && (
          <Button type="button" size="sm" width="w-auto" content={busy ? "Saving…" : "Mark completed"} disabled={busy} onClick={onComplete} />
        )}
        {appointment.patient && (
          <Button type="button" size="sm" width="w-auto" variant="outline" content="Message" onClick={onMessage} />
        )}
        {canCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className="px-2 text-sm text-red-700 hover:underline disabled:opacity-50">
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}

export default function DoctorAppointments() {
  const { goToTab } = useDoctorTab();
  const appointments = useApiQuery(loadAll, "Couldn't load your appointments");
  const [view, setView] = useState<string>("Upcoming");
  const [search, setSearch] = useState("");
  const today = todayDateString();

  const refresh = useCallback(() => {
    appointments.refetch().catch(() => {});
  }, [appointments]);
  const { complete, requestCancel, busyId, dialog } = useAppointmentActions(refresh);

  const all = useMemo(() => [...(appointments.data ?? [])].sort(byDateTime), [appointments.data]);
  const views: Record<View, IDoctorAppointment[]> = useMemo(
    () => ({
      Upcoming: all.filter((a) => a.status === "confirmed" && a.date >= today),
      Today: all.filter((a) => a.date === today && a.status !== "cancelled"),
      // Newest first for history.
      Completed: all.filter((a) => a.status === "completed").reverse(),
      Cancelled: all.filter((a) => a.status === "cancelled").reverse(),
    }),
    [all, today]
  );

  const term = search.trim().toLowerCase();
  const visible = views[view as View].filter(
    (a) => !term || `${patientName(a)} ${a.patient?.userId ?? ""} ${a.reason}`.toLowerCase().includes(term)
  );

  // Group rows under a heading per day.
  const groups = visible.reduce<{ date: string; items: IDoctorAppointment[] }[]>((acc, a) => {
    const last = acc[acc.length - 1];
    if (last?.date === a.date) last.items.push(a);
    else acc.push({ date: a.date, items: [a] });
    return acc;
  }, []);

  const tabs = (Object.keys(views) as View[]).map((key) => ({ key, label: key, appointment: views[key].length }));

  return (
    <div className="w-full">
      {dialog}
      <PageHeader title="Appointments" description="Your schedule and visit history." />

      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Tabs tabs={tabs} activeTab={view} setActiveTab={setView} />
        <label className="relative block w-full lg:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search color="#605E5E" size={16} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient or reason"
            aria-label="Search appointments"
            className="h-11 w-full rounded-lg border border-[#E7E4E4] bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-[#28574E]"
          />
        </label>
      </div>

      <div className="mt-6 space-y-6">
        {!appointments.data ? (
          appointments.error ? (
            <EmptyState icon={<CalendarDays size={28} />} title="We couldn't load your appointments" description={appointments.error} />
          ) : (
            <p className="py-10 text-center text-[#707070]">Loading appointments…</p>
          )
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-[#D7D7D7] bg-white">
            <EmptyState
              icon={<CalendarDays size={28} />}
              title={term ? "No matching appointments" : `No ${view.toLowerCase()} appointments`}
              description={
                term
                  ? "Try a different name or reason."
                  : view === "Upcoming" || view === "Today"
                  ? "When patients book with you, their visits will show here."
                  : "Nothing here yet."
              }
            />
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.date}>
              <h2 className="pb-2 fontOutfit font-medium text-[#3E3B3B]">
                {dayHeading(group.date, today)}
                <span className="pl-2 text-sm font-normal text-[#757575]">
                  {group.items.length} visit{group.items.length === 1 ? "" : "s"}
                </span>
              </h2>
              <ul className="divide-y divide-[#E6E3E3] rounded-xl border border-[#D7D7D7] bg-white">
                {group.items.map((a) => (
                  <AppointmentRow
                    key={a._id}
                    appointment={a}
                    today={today}
                    busy={busyId === a._id}
                    onOpenPatient={() => a.patient && goToTab("patients", { patient: a.patient.id })}
                    onMessage={() => a.patient && goToTab("messages", { patient: a.patient.id })}
                    onComplete={() => complete(a)}
                    onCancel={() => requestCancel(a)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
