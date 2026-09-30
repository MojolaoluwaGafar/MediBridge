import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import Tabs from "../PatientPageComponents/Appointments/Tabs";
import Button from "../Button";
import FlagCard from "./FlagCard";
import { UrgencyBadge } from "../PortalComponents/Badges";
import type { SafetyFlag } from "../../types/portal";

type Props = {
  flags: SafetyFlag[];
  onMarkReviewed?: (flag: SafetyFlag, note: string) => void;
  initialReviewing?: SafetyFlag | null;
};

export default function FlagsReview({ flags, onMarkReviewed, initialReviewing = null }: Props) {
  const [activeTab, setActiveTab] = useState("New");
  const [reviewing, setReviewing] = useState<SafetyFlag | null>(initialReviewing);
  const [note, setNote] = useState("");

  const groups: Record<string, SafetyFlag[]> = {
    New: flags.filter((f) => f.status === "new"),
    Reviewed: flags.filter((f) => f.status === "reviewed"),
    All: flags,
  };

  return (
    <div className="w-full">
      <div>
        <h1 className="fontOutfit font-semibold text-2xl">AI Safety Flags</h1>
        <p className="text-[#707070] text-base font-light">
          Chat messages and booking reasons the safety check marked urgent or emergency.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <Tabs
          tabs={Object.keys(groups).map((key) => ({ key, label: key, appointment: groups[key].length }))}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="mt-8">
        {groups[activeTab].length === 0 ? (
          <div className="w-full h-80 rounded-xl border border-[#D7D7D7] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="bg-[#EBEAEA] h-16 w-16 rounded-md flex items-center justify-center">
              <ShieldCheck size={35} />
            </span>
            <h2 className="text-[20px] font-medium">Nothing to review</h2>
            <p className="max-w-md text-[14px] text-[#666666]">
              New flags appear here when the safety check marks a message or booking as urgent.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups[activeTab].map((flag) => (
              <FlagCard key={flag._id} flag={flag} onReview={setReviewing} />
            ))}
          </div>
        )}
      </div>

      {reviewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 flex flex-col gap-4 fontOutfit">
            <div className="flex items-center gap-3">
              <p className="text-[22px] font-semibold">Review flag</p>
              <UrgencyBadge level={reviewing.level} />
            </div>
            <p className="rounded-lg bg-[#F7F4F4] px-4 py-3 text-[16px]">"{reviewing.message}"</p>
            <label htmlFor="review-note" className="flex flex-col gap-2 text-[16px] font-medium">
              What did you do?
              <textarea
                id="review-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="For example: Called the patient, they are being seen in the emergency department."
                className="min-h-[110px] rounded-lg border border-[#E7E4E4] p-3 text-[15px] font-normal focus:outline-none focus:border-[#28574E]"
              />
            </label>
            <div className="flex gap-3">
              <Button type="button" variant="outline" content="Cancel" onClick={() => setReviewing(null)} />
              <Button
                type="button"
                content="Mark Reviewed"
                onClick={() => {
                  onMarkReviewed?.(reviewing, note.trim());
                  setReviewing(null);
                  setNote("");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
