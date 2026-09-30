import React from "react";
import { CalendarDays, MessageCircleMore } from "lucide-react";
import Button from "../Button";
import { StatusBadge, UrgencyBadge } from "../PortalComponents/Badges";
import type { FlagCategory, SafetyFlag } from "../../types/portal";

const CATEGORY_LABELS: Record<FlagCategory, string> = {
  none: "General",
  self_harm: "Self-harm",
  medical: "Medical",
  harm_to_others: "Harm to others",
};

type Props = {
  flag: SafetyFlag;
  onReview?: (flag: SafetyFlag) => void;
  compact?: boolean;
};

function FlagCard({ flag, onReview, compact = false }: Props) {
  const flaggedAt = new Date(flag.flaggedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const who = flag.patient
    ? `${flag.patient.firstname} ${flag.patient.lastname} · ${flag.patient.patientId}`
    : "Visitor (not signed in)";

  return (
    <div
      className={`relative w-full rounded-xl border bg-white p-5 flex flex-col gap-3 fontOutfit ${
        flag.level === "emergency" ? "border-[#F2C4BF]" : "border-[#D7D7D7]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 pr-28">
        <UrgencyBadge level={flag.level} />
        <span className="text-[14px] text-[#605E5E]">{CATEGORY_LABELS[flag.category]}</span>
        <span className="flex items-center gap-1.5 text-[14px] text-[#605E5E]">
          {flag.source === "chat" ? <MessageCircleMore size={16} /> : <CalendarDays size={16} />}
          {flag.source === "chat" ? "AI chat" : "Booking reason"}
        </span>
      </div>

      <span className="absolute top-3 right-3">
        <StatusBadge status={flag.status} />
      </span>

      <div>
        <p className="text-[18px] font-medium text-[#141313]">{who}</p>
        <p className="text-[14px] text-[#666666]">{flaggedAt}</p>
      </div>

      <p className="rounded-lg bg-[#F7F4F4] px-4 py-3 text-[16px] text-[#141313]">
        "{flag.message}"
      </p>

      {!compact && <p className="text-[14px] text-[#605E5E]">Why it was flagged: {flag.reason}</p>}

      {flag.status === "reviewed" && flag.reviewNote && !compact && (
        <p className="text-[14px] text-[#28574E]">
          Reviewed by {flag.reviewedBy}: {flag.reviewNote}
        </p>
      )}

      {flag.status === "new" && (
        <Button
          type="button"
          width="w-full lg:w-[164px]"
          content="Review"
          onClick={() => onReview?.(flag)}
        />
      )}
    </div>
  );
}

export default React.memo(FlagCard);
