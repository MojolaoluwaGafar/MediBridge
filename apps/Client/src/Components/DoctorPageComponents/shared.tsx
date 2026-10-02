import { useEffect, useState, type ReactNode } from "react";
import { FileText, TriangleAlert } from "lucide-react";
import Button from "../Button";
import { STATUS_STYLES } from "../../utils/appointmentStatus";
import type { IDoctorAppointment } from "../../types/doctorPortal";
import type { UrgencyLevel } from "../../types/apiReqRes";
import { patientName, shortDate } from "../../utils/doctorFormat";

// Small pieces shared by the doctor portal's screens.

export function Chip({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: IDoctorAppointment["status"] }) {
  const style = STATUS_STYLES[status];
  return <Chip className={style.className}>{style.label}</Chip>;
}

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  routine: "bg-[#EBEBEB] text-[#3E3B3B]",
  urgent: "bg-[#FFF4E0] text-[#8A5A00]",
  emergency: "bg-[#FDECEA] text-[#8C1D18]",
};

// Only urgent and emergency are worth a chip; routine is the default.
export function UrgencyChip({ level, always = false }: { level?: UrgencyLevel | null; always?: boolean }) {
  if (!level || (level === "routine" && !always)) return null;
  return (
    <Chip className={URGENCY_STYLES[level]}>
      {level !== "routine" && <TriangleAlert size={12} />}
      {level[0].toUpperCase() + level.slice(1)}
    </Chip>
  );
}

export function RecordsSharedChip() {
  return (
    <Chip className="bg-[#E0F8F3] text-[#28574E]">
      <FileText size={12} /> Records shared
    </Chip>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-[#D7D7D7] bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          {title && <h2 className="fontOutfit text-lg font-medium">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type CancelProps = {
  appointment: IDoctorAppointment;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

// Cancelling tells the patient, so the doctor can add a reason that goes in
// the message they receive.
export function CancelAppointmentDialog({ appointment, busy, onConfirm, onClose }: CancelProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        className="w-full max-w-md rounded-xl bg-white p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cancel-title" className="fontOutfit text-xl font-medium">Cancel this appointment?</h2>
        <p className="pt-2 text-sm text-[#605E5E]">
          {patientName(appointment)} · {shortDate(appointment.date)} at {appointment.time}. They'll get a message from you
          and the slot opens up for other patients.
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="cancel-reason">
          Reason for the patient <span className="font-normal text-[#757575]">(optional)</span>
        </label>
        <textarea
          id="cancel-reason"
          value={reason}
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          placeholder="e.g. I'm away that day. Please book with a colleague or pick another date."
          className="mt-1 w-full rounded-md border border-[#D9D9D9] px-3 py-2 text-sm focus:outline-none focus:border-[#28574E]"
        />

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" size="sm" variant="outline" width="w-full sm:w-auto" content="Keep appointment" onClick={onClose} disabled={busy} />
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy}
            className="h-10 w-full rounded-md bg-red-700 px-4 text-sm text-white fontOutfit hover:bg-red-800 disabled:opacity-50 sm:w-auto"
          >
            {busy ? "Cancelling…" : "Cancel appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
