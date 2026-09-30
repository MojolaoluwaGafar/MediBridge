import React, { useMemo } from "react";
import { CalendarDays, Clock, FileText, TriangleAlert } from "lucide-react";
import Button from "../Button";
import InitialsAvatar from "../PortalComponents/InitialsAvatar";
import { StatusBadge, UrgencyBadge } from "../PortalComponents/Badges";
import type { DoctorAppointment } from "../../types/portal";

type Props = {
  appointment: DoctorAppointment;
  onViewPatient?: (appointment: DoctorAppointment) => void;
  onMessage?: (appointment: DoctorAppointment) => void;
};

// The patient appointment card (Appointments/Card.tsx) seen from the doctor's side.
function PatientAppointmentCard({ appointment, onViewPatient, onMessage }: Props) {
  const { patient, date, time, reason, status, urgency, shareRecords } = appointment;

  const formattedDate = useMemo(
    () =>
      new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [date]
  );

  const flagged = urgency && urgency.level !== "routine";

  return (
    <div
      className={`w-full relative rounded-xl border bg-white p-5 flex flex-col gap-4 ${
        urgency?.level === "emergency"
          ? "border-[#F2C4BF]"
          : urgency?.level === "urgent"
          ? "border-[#F3D9A4]"
          : "border-[#D7D7D7]"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-3 pr-0 lg:pr-32">
        <InitialsAvatar firstname={patient.firstname} lastname={patient.lastname} />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[#141313] fontOutfit font-medium text-[20px]">
              {patient.firstname} {patient.lastname}
            </h1>
            {flagged && <UrgencyBadge level={urgency.level} />}
          </div>
          <p className="text-[#605E5E] fontOutfit font-light text-[16px]">
            Patient ID {patient.patientId}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-[#605E5E]">
            <p className="flex items-center gap-2">
              <CalendarDays size={18} color="#605E5E" /> {formattedDate}
            </p>
            <p className="flex items-center gap-2">
              <Clock size={18} color="#605E5E" /> {time}
            </p>
            {shareRecords && (
              <p className="flex items-center gap-2 text-[#28574E]">
                <FileText size={18} /> Records shared
              </p>
            )}
          </div>
        </div>
      </div>

      <span className="absolute top-3 right-3">
        <StatusBadge status={status} />
      </span>

      <div className="rounded-lg bg-[#F7F4F4] px-4 py-3 fontOutfit">
        <p className="text-[14px] text-[#666666]">Reason for visit</p>
        <p className="text-[16px] text-[#141313]">{reason}</p>
        {flagged && (
          <p
            className={`mt-2 flex items-start gap-2 text-[14px] ${
              urgency.level === "emergency" ? "text-[#B3261E]" : "text-[#8A5A0B]"
            }`}
          >
            <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
            Marked {urgency.level} by the safety check: {urgency.reason}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row w-full items-center gap-5">
        <Button
          type="button"
          width="w-full lg:w-[164px]"
          content="View Patient"
          onClick={() => onViewPatient?.(appointment)}
        />
        {status === "confirmed" && (
          <button
            className="text-[#3E3B3B] fontOutfit font-normal"
            type="button"
            onClick={() => onMessage?.(appointment)}
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(PatientAppointmentCard);
