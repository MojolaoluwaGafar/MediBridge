import { useCallback, useState, type ReactNode } from "react";
import { ArrowLeft, CalendarDays, Clock, FileText, Lock, Mail, Phone, UserRound } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import EmptyState from "../../PortalComponents/EmptyState";
import Button from "../../Button";
import RecordDetailsModal from "../../PatientPageComponents/MedicalRecords/RecordDetailsModal";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { useAppointmentActions } from "../../../Hooks/Doctor/useAppointmentActions";
import { useDownloadRecord } from "../../../Hooks/Records/useRecords";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import type { IDoctorAppointment, IDoctorPatientProfile, ISharedRecordSummary } from "../../../types/doctorPortal";
import { RECORD_TYPE_LABELS, type IMedicalRecord } from "../../../types/record";
import type { UrgencyLevel } from "../../../types/apiReqRes";
import { formatMessageTime, todayDateString } from "../../../utils/formatDate";
import { apiErrorMessage } from "../../../utils/apiError";
import { showToast } from "../../../utils/toastHelper";
import { useDoctorTab } from "../DoctorTabs";
import { RecordsSharedChip, SectionCard, StatusChip, UrgencyChip } from "../shared";
import { dayHeading, hasStarted, mediumDate } from "../../../utils/doctorFormat";

type Tab = "overview" | "appointments" | "records";

type Props = { patientId: string; onBack: () => void };

function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-[#757575]">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}

function HistoryTable({
  appointments,
  today,
  limit,
  actions,
}: {
  appointments: IDoctorAppointment[];
  today: string;
  limit?: number;
  actions?: (a: IDoctorAppointment) => ReactNode;
}) {
  const rows = limit ? appointments.slice(0, limit) : appointments;
  if (rows.length === 0) return <p className="px-5 pb-5 pt-3 text-sm text-[#757575]">No appointments yet.</p>;

  return (
    <ul className="mt-3 divide-y divide-[#E6E3E3] border-t border-[#E6E3E3]">
      {rows.map((a) => (
        <li key={a._id} className="flex flex-col gap-2 px-4 py-3 sm:px-5 md:flex-row md:items-center md:gap-4">
          <span className="w-44 shrink-0 text-sm">
            <span className="block font-medium">{a.date === today ? "Today" : mediumDate(a.date)}</span>
            <span className="block text-xs text-[#757575]">{a.time}</span>
          </span>
          <span className="min-w-0 flex-1 text-sm text-[#3E3B3B]">{a.reason}</span>
          <span className="flex flex-wrap items-center gap-2">
            <UrgencyChip level={a.urgency?.level} />
            <StatusChip status={a.status} />
            {actions?.(a)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SharedRecords({
  profile,
  limit,
  onView,
}: {
  profile: IDoctorPatientProfile;
  limit?: number;
  onView: (record: ISharedRecordSummary) => void;
}) {
  const { patient, recordsShared, records } = profile;

  if (!recordsShared) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EBEAEA] text-[#3E3B3B]">
          <Lock size={22} />
        </span>
        <p className="fontOutfit font-medium">Records not shared</p>
        <p className="text-sm text-[#605E5E]">
          {patient.firstname} hasn't shared their medical records with you. Patients choose this when they book; you can
          ask them to tick “Share medical history” on their next booking.
        </p>
      </div>
    );
  }

  const rows = limit ? records.slice(0, limit) : records;
  if (rows.length === 0) {
    return <p className="px-5 pb-5 pt-3 text-sm text-[#757575]">Records are shared, but the hospital hasn't added any yet.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-[#E6E3E3] border-t border-[#E6E3E3]">
      {rows.map((r) => (
        <li key={r._id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E0F8F3] text-[#28574E]">
            <FileText size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{r.title}</span>
            <span className="block text-xs text-[#757575]">
              {RECORD_TYPE_LABELS[r.type]} · {mediumDate(String(r.visitDate).slice(0, 10))}
            </span>
          </span>
          <button type="button" onClick={() => onView(r)} className="text-sm font-medium text-[#28574E] hover:underline">
            View
          </button>
        </li>
      ))}
    </ul>
  );
}

function VisitNotes({ profile, onSaved }: { profile: IDoctorPatientProfile; onSaved: () => void }) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      await doctorPortalService.addNote(profile.patient.id, body.trim(), profile.nextAppointment?._id);
      setBody("");
      showToast("Note saved", "success");
      onSaved();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't save the note"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
      <label htmlFor="visit-note" className="sr-only">New note</label>
      <textarea
        id="visit-note"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        maxLength={5000}
        placeholder="Add notes for this visit…"
        className="w-full rounded-md border border-[#D9D9D9] px-3 py-2 text-sm focus:outline-none focus:border-[#28574E]"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-[#757575]">Only you can see these notes.</p>
        <Button type="button" size="sm" width="w-auto" className="shrink-0 whitespace-nowrap" content={saving ? "Saving…" : "Save note"} disabled={saving || !body.trim()} onClick={save} />
      </div>

      {profile.notes.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-[#E6E3E3] pt-4">
          {profile.notes.map((note) => (
            <li key={note._id}>
              <p className="text-xs text-[#757575]">{formatMessageTime(note.createdAt)}</p>
              <p className="whitespace-pre-line wrap-break-word text-sm">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UrgencySelect({ appointment, onChanged }: { appointment: IDoctorAppointment; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);

  const change = async (level: UrgencyLevel) => {
    setSaving(true);
    try {
      await doctorPortalService.setUrgency(appointment._id, level);
      showToast("Urgency updated", "success");
      onChanged();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't update urgency"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-[#605E5E]">Urgency</span>
      <select
        value={appointment.urgency?.level ?? "routine"}
        disabled={saving}
        onChange={(event) => change(event.target.value as UrgencyLevel)}
        className="h-9 rounded-md border border-[#D9D9D9] bg-white px-2 text-sm focus:outline-none focus:border-[#28574E]"
      >
        <option value="routine">Routine</option>
        <option value="urgent">Urgent</option>
        <option value="emergency">Emergency</option>
      </select>
    </label>
  );
}

export default function PatientProfile({ patientId, onBack }: Props) {
  const { goToTab } = useDoctorTab();
  const load = useCallback(() => doctorPortalService.getPatient(patientId), [patientId]);
  const query = useApiQuery(load, "Couldn't load this patient");
  const [tab, setTab] = useState<Tab>("overview");
  const [openRecord, setOpenRecord] = useState<IMedicalRecord | null>(null);
  const today = todayDateString();

  const refresh = useCallback(() => {
    query.refetch().catch(() => {});
  }, [query]);
  const { complete, requestCancel, busyId, dialog } = useAppointmentActions(refresh);

  const fetchPdf = useCallback(
    (record: Pick<IMedicalRecord, "_id">) => doctorPortalService.downloadPatientRecord(patientId, record._id),
    [patientId]
  );
  const { download, downloadingId } = useDownloadRecord(fetchPdf);

  const viewRecord = async (summary: ISharedRecordSummary) => {
    try {
      setOpenRecord(await doctorPortalService.getPatientRecord(patientId, summary._id));
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't open this record"), "error");
    }
  };

  const back = (
    <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-[#28574E] hover:underline">
      <ArrowLeft size={16} /> Back to patients
    </button>
  );

  const profile = query.data;
  if (!profile) {
    return (
      <div className="w-full space-y-4">
        {back}
        {query.error ? (
          <EmptyState icon={<UserRound size={28} />} title="We couldn't load this patient" description={query.error} />
        ) : (
          <p className="py-10 text-center text-[#707070]">Loading patient…</p>
        )}
      </div>
    );
  }

  const { patient, nextAppointment } = profile;
  const name = `${patient.firstname} ${patient.lastname}`;

  const appointmentActions = (a: IDoctorAppointment) => {
    if (a.status !== "confirmed") return null;
    return (
      <>
        {hasStarted(a, today) && (
          <Button type="button" size="sm" width="w-auto" content={busyId === a._id ? "Saving…" : "Mark completed"} disabled={busyId === a._id} onClick={() => complete(a)} />
        )}
        {a.date >= today && (
          <button type="button" onClick={() => requestCancel(a)} className="px-1 text-sm text-red-700 hover:underline">
            Cancel
          </button>
        )}
      </>
    );
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "appointments", label: `Appointments (${profile.appointments.length})` },
    { key: "records", label: "Records" },
  ];

  return (
    <div className="w-full space-y-6">
      {dialog}
      {openRecord && (
        <RecordDetailsModal
          record={openRecord}
          downloading={downloadingId === openRecord._id}
          onDownload={download}
          onClose={() => setOpenRecord(null)}
        />
      )}

      {back}

      <section className="flex flex-col gap-5 rounded-xl border border-[#D7D7D7] bg-white p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={name} image={patient.img} size="xl" />
          <div className="min-w-0">
            <h1 className="fontOutfit text-xl font-medium sm:text-2xl">{name}</h1>
            <div className="mt-1 flex flex-col gap-1 text-sm text-[#605E5E] sm:flex-row sm:flex-wrap sm:gap-x-4">
              <Meta icon={<UserRound size={14} />}>Patient ID {patient.userId}</Meta>
              <Meta icon={<Phone size={14} />}>{patient.phone}</Meta>
              <Meta icon={<Mail size={14} />}>{patient.email}</Meta>
            </div>
            {profile.recordsShared && <div className="mt-2"><RecordsSharedChip /></div>}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <p className="text-sm">
            <span className="text-[#605E5E]">Next visit: </span>
            <span className="font-medium">
              {nextAppointment ? `${dayHeading(nextAppointment.date, today)}, ${nextAppointment.time}` : "None booked"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" width="w-auto" variant="outline" content="Message" onClick={() => goToTab("messages", { patient: patient.id })} />
            {nextAppointment && hasStarted(nextAppointment, today) && (
              <Button type="button" size="sm" width="w-auto" content="Mark visit completed" onClick={() => complete(nextAppointment)} />
            )}
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="Patient details" className="flex gap-6 overflow-x-auto border-b border-[#E6E3E3]">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition sm:text-base ${
              tab === t.key ? "border-[#28574E] text-[#28574E]" : "border-transparent text-[#605E5E] hover:text-[#141313]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <SectionCard title="Reason for the next visit">
              {nextAppointment ? (
                <div className="space-y-3 px-4 pb-5 pt-3 sm:px-5">
                  <p className="whitespace-pre-line text-[#3E3B3B]">{nextAppointment.reason}</p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#605E5E]">
                    <Meta icon={<CalendarDays size={14} />}>{dayHeading(nextAppointment.date, today)}</Meta>
                    <Meta icon={<Clock size={14} />}>{nextAppointment.time}</Meta>
                    <span>{nextAppointment.department}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <UrgencySelect appointment={nextAppointment} onChanged={refresh} />
                    {nextAppointment.urgency?.reason && nextAppointment.urgency.source !== "doctor" && (
                      <span className="text-xs text-[#757575]">Flagged automatically: {nextAppointment.urgency.reason}</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="px-5 pb-5 pt-3 text-sm text-[#757575]">No upcoming visit booked.</p>
              )}
            </SectionCard>

            <SectionCard
              title="Appointment history"
              action={
                profile.appointments.length > 5 && (
                  <button type="button" onClick={() => setTab("appointments")} className="text-sm font-medium text-[#28574E] hover:underline">
                    View all
                  </button>
                )
              }
            >
              <HistoryTable appointments={profile.appointments} today={today} limit={5} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Shared records" action={profile.recordsShared && profile.records.length > 3 && (
              <button type="button" onClick={() => setTab("records")} className="text-sm font-medium text-[#28574E] hover:underline">View all</button>
            )}>
              <SharedRecords profile={profile} limit={3} onView={viewRecord} />
            </SectionCard>

            <SectionCard title="Visit notes">
              <VisitNotes profile={profile} onSaved={refresh} />
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "appointments" && (
        <SectionCard>
          <HistoryTable appointments={profile.appointments} today={today} actions={appointmentActions} />
        </SectionCard>
      )}

      {tab === "records" && (
        <SectionCard title="Shared records">
          <SharedRecords profile={profile} onView={viewRecord} />
        </SectionCard>
      )}
    </div>
  );
}
