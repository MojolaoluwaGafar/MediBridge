import { useCallback, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CalendarX2,
  CircleCheck,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Users,
  CalendarCheck,
  XCircle,
} from "lucide-react";
import DashboardGreeting from "../../PatientPageComponents/DashBoard/DashboardGreeting";
import EmptyState from "../../PortalComponents/EmptyState";
import Avatar from "../../PortalComponents/Avatar";
import Button from "../../Button";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { usePolling } from "../../../Hooks/Portal/usePolling";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import type { IAttentionFlag, IDoctorActivity, IDoctorAppointment } from "../../../types/doctorPortal";
import type { AuthUser } from "../../../types/auth";
import { formatRelativeDay } from "../../../utils/formatDate";
import { apiErrorMessage } from "../../../utils/apiError";
import { showToast } from "../../../utils/toastHelper";
import { useDoctorTab } from "../DoctorTabs";
import { SectionCard, StatusChip, UrgencyChip, RecordsSharedChip } from "../shared";
import { patientName, shortDate } from "../../../utils/doctorFormat";

const REFRESH_MS = 60_000;

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const longToday = () =>
  new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function StatTile({ icon, label, value, tone = "default" }: { icon: ReactNode; label: string; value: number; tone?: "default" | "alert" }) {
  const alert = tone === "alert" && value > 0;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#D7D7D7] bg-white p-4">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
          alert ? "bg-[#FDECEA] text-[#8C1D18]" : "bg-[#E0F8F3] text-[#28574E]"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-[#605E5E]">{label}</p>
        <p className="fontOutfit text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ScheduleRow({ appointment, isNext, onOpen }: { appointment: IDoctorAppointment; isNext: boolean; onOpen: () => void }) {
  const done = appointment.status === "completed";
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`relative flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 sm:px-5 ${done ? "opacity-70" : ""}`}
      >
        {isNext && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-[#28574E]" aria-hidden="true" />}
        <span className="w-16 shrink-0 sm:w-18">
          <span className="block fontOutfit text-sm font-medium">{appointment.time}</span>
          <span className={`block text-xs ${isNext ? "font-medium text-[#28574E]" : "text-[#605E5E]"}`}>
            {isNext ? "Next" : "30 min"}
          </span>
        </span>
        <Avatar name={patientName(appointment)} image={appointment.patient?.img} />
        <span className="min-w-0 flex-1">
          <span className="block truncate fontOutfit text-sm font-medium">{patientName(appointment)}</span>
          <span className="block truncate text-xs text-[#605E5E]">{appointment.reason}</span>
        </span>
        <span className="hidden shrink-0 flex-wrap justify-end gap-1 sm:flex">
          <UrgencyChip level={appointment.urgency?.level} />
          {appointment.shareRecords && <RecordsSharedChip />}
          <StatusChip status={appointment.status} />
        </span>
      </button>
      {/* Phones: chips go under the row so names don't get squeezed. */}
      <span className="flex flex-wrap gap-1 px-4 pb-3 pl-[5.75rem] empty:hidden sm:hidden">
        {appointment.urgency?.level && appointment.urgency.level !== "routine" && <UrgencyChip level={appointment.urgency.level} />}
        {done && <StatusChip status="completed" />}
      </span>
    </li>
  );
}

const SOURCE_LABEL: Record<IAttentionFlag["source"], string> = {
  message: "Message to you",
  booking: "Booking reason",
  chat: "AI support chat",
};

function AttentionCard({ flag, busy, onOpen, onReviewed }: { flag: IAttentionFlag; busy: boolean; onOpen: () => void; onReviewed: () => void }) {
  return (
    <li className="rounded-xl border border-[#D7D7D7] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate fontOutfit font-medium">{flag.patient ? `${flag.patient.firstname} ${flag.patient.lastname}` : "Unknown patient"}</p>
          <p className="text-xs text-[#605E5E]">
            {SOURCE_LABEL[flag.source]} · {formatRelativeDay(flag.flaggedAt)}
            {flag.appointment && ` · visit ${shortDate(flag.appointment.date)}, ${flag.appointment.time}`}
          </p>
        </div>
        <UrgencyChip level={flag.level} always />
      </div>
      <p className="mt-2 text-sm font-medium text-[#3E3B3B]">{flag.reason}</p>
      <p className="mt-1 line-clamp-2 border-l-2 border-[#D7D7D7] pl-2 text-sm italic text-[#605E5E]">“{flag.message}”</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {flag.patient && <Button type="button" size="sm" width="w-auto" content="Open patient" onClick={onOpen} />}
        <Button type="button" size="sm" width="w-auto" variant="outline" content={busy ? "Saving…" : "Mark reviewed"} disabled={busy} onClick={onReviewed} />
      </div>
    </li>
  );
}

const ACTIVITY_ICON: Record<IDoctorActivity["type"], ReactNode> = {
  confirmed: <CalendarCheck size={18} />,
  rescheduled: <RefreshCw size={18} />,
  cancelled: <XCircle size={18} />,
};

function activityText(a: IDoctorActivity) {
  const who = a.patient ? `${a.patient.firstname} ${a.patient.lastname}` : "A patient";
  const when = a.date ? `${shortDate(a.date)}${a.time ? `, ${a.time}` : ""}` : "";
  if (a.actor === "doctor") return `You cancelled ${who}'s appointment${when ? ` for ${when}` : ""}.`;
  if (a.type === "confirmed") return `${who} booked an appointment${when ? ` for ${when}` : ""}.`;
  if (a.type === "rescheduled") return `${who} rescheduled to ${when || "a new time"}.`;
  return `${who} cancelled their appointment${when ? ` for ${when}` : ""}.`;
}

type Props = { user: AuthUser | null; doctorName: string };

export default function DoctorDashboard({ user, doctorName }: Props) {
  const { goToTab } = useDoctorTab();
  const dashboard = useApiQuery(doctorPortalService.getDashboard, "Couldn't load your dashboard");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    dashboard.refetch().catch(() => {});
  }, [dashboard]);
  usePolling(refresh, REFRESH_MS);

  const openPatient = (id?: string) => id && goToTab("patients", { patient: id });

  const markReviewed = async (flag: IAttentionFlag) => {
    setReviewingId(flag._id);
    try {
      await doctorPortalService.reviewFlag(flag._id);
      showToast("Marked as reviewed", "success");
      refresh();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't update the alert"), "error");
    } finally {
      setReviewingId(null);
    }
  };

  const data = dashboard.data;

  if (!data) {
    return dashboard.error ? (
      <EmptyState icon={<CalendarDays size={28} />} title="We couldn't load your dashboard" description={dashboard.error} />
    ) : (
      <p className="py-10 text-center text-[#707070]">Loading your dashboard…</p>
    );
  }

  const { stats } = data;
  const subtitle =
    stats.today === 0
      ? "You have no appointments today."
      : `You have ${stats.today} appointment${stats.today === 1 ? "" : "s"} today${
          stats.remainingToday < stats.today ? `, ${stats.remainingToday} still to come` : ""
        }${stats.needsAttention ? ` and ${stats.needsAttention} alert${stats.needsAttention === 1 ? "" : "s"} to review` : ""}.`;

  return (
    <div className="w-full space-y-8">
      <DashboardGreeting user={user} title={`${greeting()}, ${doctorName}`} subtitle={subtitle} aside={longToday()} />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <StatTile icon={<CalendarDays size={22} />} label="Today's appointments" value={stats.today} />
        <StatTile icon={<TriangleAlert size={22} />} label="Needs attention" value={stats.needsAttention} tone="alert" />
        <StatTile icon={<Users size={22} />} label="Patients this week" value={stats.patientsThisWeek} />
        <StatTile icon={<CircleCheck size={22} />} label="Completed this week" value={stats.completedThisWeek} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        <div className="xl:col-span-2">
          <SectionCard
            title="Today's schedule"
            action={
              <button type="button" onClick={() => goToTab("appointments")} className="text-sm font-medium text-[#28574E] hover:underline">
                View all
              </button>
            }
          >
            {data.schedule.length === 0 ? (
              <EmptyState
                icon={<CalendarX2 size={28} />}
                title="No appointments today"
                description="Confirmed appointments for today will show here."
              />
            ) : (
              <ul className="mt-3 divide-y divide-[#E6E3E3] border-t border-[#E6E3E3]">
                {data.schedule.map((appointment) => (
                  <ScheduleRow
                    key={appointment._id}
                    appointment={appointment}
                    isNext={appointment._id === data.nextAppointmentId}
                    onOpen={() => openPatient(appointment.patient?.id)}
                  />
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div>
          <div className="flex items-center gap-2 pb-3">
            <h2 className="fontOutfit text-lg font-medium">Needs attention</h2>
            {stats.needsAttention > 0 && (
              <span className="rounded-full bg-[#FDECEA] px-2 text-sm font-medium text-[#8C1D18]">{stats.needsAttention}</span>
            )}
          </div>
          {data.needsAttention.length === 0 ? (
            <div className="rounded-xl border border-[#D7D7D7] bg-white">
              <EmptyState
                icon={<ShieldCheck size={28} />}
                title="You're all caught up"
                description="Messages or bookings that sound urgent will show here for you to review."
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {data.needsAttention.map((flag) => (
                <AttentionCard
                  key={flag._id}
                  flag={flag}
                  busy={reviewingId === flag._id}
                  onOpen={() => openPatient(flag.patient?.id)}
                  onReviewed={() => markReviewed(flag)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="pb-3 fontOutfit text-lg font-medium md:text-[24px]">Recent activity</h2>
        <div className="rounded-xl border border-[#D7D7D7] bg-white p-4">
          {data.activity.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#757575]">Bookings, changes and cancellations will show here.</p>
          ) : (
            <ul className="space-y-4">
              {data.activity.map((a) => (
                <li key={a._id} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EBEAEA] text-[#3E3B3B]">
                    {ACTIVITY_ICON[a.type]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm sm:text-base">{activityText(a)}</span>
                    <span className="block text-xs text-[#757575]">{formatRelativeDay(a.timestamp)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
