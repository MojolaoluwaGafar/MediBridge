import { useState } from "react";
import { ArrowLeft, CalendarDays, Clock, FileText, Lock, Mail, Phone, TriangleAlert } from "lucide-react";
import Button from "../Button";
import InitialsAvatar from "../PortalComponents/InitialsAvatar";
import { StatusBadge, UrgencyBadge } from "../PortalComponents/Badges";
import type { DoctorAppointment, PortalPatient } from "../../types/portal";

export type SharedRecord = { id: string; title: string; date: string; kind: string };
export type VisitNote = { id: string; date: string; author: string; text: string };

type Props = {
  patient: PortalPatient;
  currentAppointment: DoctorAppointment;
  history: DoctorAppointment[];
  records: SharedRecord[];
  notes: VisitNote[];
  onBack?: () => void;
  onSaveNote?: (text: string) => void;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

export default function PatientProfile({
  patient,
  currentAppointment,
  history,
  records,
  notes,
  onBack,
  onSaveNote,
}: Props) {
  const [draft, setDraft] = useState("");
  const { urgency } = currentAppointment;
  const firstName = patient.firstname;

  return (
    <div className="w-full flex flex-col gap-6 fontOutfit">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-[16px] font-medium text-[#28574E]"
      >
        <ArrowLeft size={18} /> Back to appointments
      </button>

      <div className="rounded-xl border border-[#D7D7D7] bg-white p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
        <InitialsAvatar firstname={patient.firstname} lastname={patient.lastname} size="lg" />
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <h1 className="text-[28px] font-semibold text-[#141313]">
            {patient.firstname} {patient.lastname}
          </h1>
          <p className="text-[16px] font-light text-[#605E5E]">Patient ID {patient.patientId}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-[#605E5E]">
            {patient.phone && (
              <p className="flex items-center gap-2"><Phone size={16} /> {patient.phone}</p>
            )}
            {patient.email && (
              <p className="flex items-center gap-2 break-all"><Mail size={16} /> {patient.email}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <p className="text-[14px] text-[#666666]">Next visit</p>
          <p className="flex items-center gap-2 text-[16px] font-medium">
            <CalendarDays size={18} color="#605E5E" /> {formatDate(currentAppointment.date)}
            <Clock size={18} color="#605E5E" className="ml-2" /> {currentAppointment.time}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" width="w-[140px]" content="Message" />
            <Button type="button" width="w-[160px]" content="Start Visit" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <section className="rounded-xl border border-[#D7D7D7] bg-white p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xl sm:text-2xl font-medium">Reason for this visit</p>
              {urgency && urgency.level !== "routine" && <UrgencyBadge level={urgency.level} />}
            </div>
            <p className="rounded-lg bg-[#F7F4F4] px-4 py-3 text-[16px] text-[#141313]">
              "{currentAppointment.reason}"
            </p>
            {urgency && urgency.level !== "routine" && (
              <p className="flex items-start gap-2 text-[14px] text-[#8A5A0B]">
                <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
                Marked {urgency.level} by the safety check: {urgency.reason}. You can change this if it's wrong.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-[#D7D7D7] bg-white p-5">
            <p className="pb-4 text-xl sm:text-2xl font-medium">Appointment history</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <thead>
                  <tr className="text-[14px] text-[#666666]">
                    <th className="pb-3 pr-6 font-normal">Date</th>
                    <th className="pb-3 pr-6 font-normal">Time</th>
                    <th className="pb-3 font-normal">Reason</th>
                    <th className="pb-3 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((visit) => (
                    <tr key={visit._id} className="border-t border-[#E7E4E4]">
                      <td className="py-3 pr-6 whitespace-nowrap font-medium text-[#141313]">{formatDate(visit.date)}</td>
                      <td className="py-3 pr-6 whitespace-nowrap text-[#605E5E]">{visit.time}</td>
                      <td className="py-3 pr-4 text-[#605E5E]">{visit.reason}</td>
                      <td className="py-3 text-right"><StatusBadge status={visit.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="w-full lg:max-w-[391px] flex flex-col gap-6">
          <section className="rounded-xl border border-[#D7D7D7] bg-white p-5">
            <p className="pb-4 text-xl sm:text-2xl font-medium">Shared records</p>
            {currentAppointment.shareRecords ? (
              <div className="flex flex-col gap-3">
                {records.map((record) => (
                  <div key={record.id} className="min-h-[60px] border border-[#E7E4E4] rounded-lg flex items-center gap-3 px-4 py-2">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#E3FDF7] text-[#28574E]">
                      <FileText size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-medium">{record.title}</p>
                      <p className="text-[13px] text-[#666666]">{formatDate(record.date)} · {record.kind}</p>
                    </div>
                    <button type="button" className="text-[14px] font-medium text-[#28574E]">View</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="bg-[#EBEAEA] h-16 w-16 rounded-md flex items-center justify-center">
                  <Lock size={30} />
                </span>
                <p className="text-[18px] font-medium">Records not shared</p>
                <p className="text-[14px] text-[#666666]">
                  {firstName} didn't share medical records for this appointment.
                </p>
                <Button type="button" variant="outline" width="w-[194px]" content="Request Access" />
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#D7D7D7] bg-white p-5 flex flex-col gap-3">
            <p className="text-xl sm:text-2xl font-medium">Visit notes</p>
            <label htmlFor="visit-note" className="text-[14px] text-[#666666]">
              Only doctors can see these notes.
            </label>
            <textarea
              id="visit-note"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add notes for this visit..."
              className="min-h-[110px] w-full rounded-lg border border-[#E7E4E4] p-3 text-[15px] focus:outline-none focus:border-[#28574E]"
            />
            <Button
              type="button"
              content="Save Note"
              disabled={!draft.trim()}
              onClick={() => {
                onSaveNote?.(draft.trim());
                setDraft("");
              }}
            />
            {notes.map((note) => (
              <div key={note.id} className="border-t border-[#E7E4E4] pt-3">
                <p className="text-[13px] text-[#666666]">{formatDate(note.date)} · {note.author}</p>
                <p className="text-[15px] text-[#3E3B3B]">{note.text}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
