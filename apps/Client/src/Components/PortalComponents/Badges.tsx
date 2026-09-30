import type { UrgencyLevel } from "../../types/apiReqRes";

// Same pill as the patient appointment cards.
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-[#E0F8F3] text-[#28574E]",
    completed: "bg-[#EBEAEA] text-[#3E3B3B]",
    cancelled: "bg-[#FDECEA] text-[#B3261E]",
    pending: "bg-[#FFF4E0] text-[#8A5A0B]",
    new: "bg-[#FFF4E0] text-[#8A5A0B]",
    reviewed: "bg-[#E0F8F3] text-[#28574E]",
  };

  return (
    <span
      className={`inline-flex h-10 min-w-26 items-center justify-center rounded-3xl px-4 fontOutfit capitalize ${
        styles[status.toLowerCase()] ?? styles.confirmed
      }`}
    >
      {status}
    </span>
  );
}

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  routine: "bg-[#F7F4F4] text-[#605E5E]",
  urgent: "bg-[#FFF4E0] text-[#8A5A0B]",
  emergency: "bg-[#FDECEA] text-[#B3261E]",
};

export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-3xl px-3 text-[13px] font-medium fontOutfit capitalize ${URGENCY_STYLES[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}
