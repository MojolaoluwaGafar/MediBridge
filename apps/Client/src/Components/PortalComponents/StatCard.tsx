import React from "react";

type Props = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  note?: string;
  noteTone?: "neutral" | "good" | "warning";
};

export default function StatCard({ label, value, icon, note, noteTone = "neutral" }: Props) {
  const noteColors = {
    neutral: "text-[#666666]",
    good: "text-[#28574E]",
    warning: "text-[#B3261E]",
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#D7D7D7] bg-white p-5 fontOutfit">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[16px] font-light text-[#605E5E]">{label}</p>
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#E3FDF7] text-[#28574E]">
          {icon}
        </span>
      </div>
      <p className="text-[32px] font-medium leading-none text-[#141313]">{value}</p>
      {note && <p className={`text-[14px] ${noteColors[noteTone]}`}>{note}</p>}
    </div>
  );
}
