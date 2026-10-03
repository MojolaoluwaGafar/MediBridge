import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";
import PageHeader from "../PortalComponents/PageHeader";
import EmptyState from "../PortalComponents/EmptyState";
import Button from "../Button";
import Tabs from "../PatientPageComponents/Appointments/Tabs";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { adminService } from "../../API/services/adminService";
import type { IFlag } from "../../types/admin";
import { formatMessageTime } from "../../utils/formatDate";
import { apiErrorMessage } from "../../utils/apiError";
import { inputClass } from "../../utils/formStyles";
import { showToast } from "../../utils/toastHelper";
import { Pill } from "./ui";

const SOURCE: Record<IFlag["source"], string> = { chat: "AI support chat", booking: "Booking reason", message: "Message to a doctor" };

function FlagCard({ flag, onReviewed }: { flag: IFlag; onReviewed: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const review = async () => {
    setBusy(true);
    try {
      await adminService.reviewFlag(flag._id, note.trim() || undefined);
      showToast("Marked as reviewed", "success");
      onReviewed();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't update the alert"), "error");
    } finally {
      setBusy(false);
    }
  };

  const who = flag.userId ? `${flag.userId.FirstName} ${flag.userId.LastName} (${flag.userId.UserId})` : "Visitor (not signed in)";

  return (
    <li className="space-y-3 rounded-xl border border-[#D7D7D7] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="fontOutfit font-medium">{who}</p>
          <p className="text-xs text-[#757575]">{SOURCE[flag.source]} · {formatMessageTime(flag.flaggedAt)}</p>
        </div>
        <Pill tone={flag.level === "emergency" ? "red" : "amber"}>{flag.level}</Pill>
      </div>
      <p className="text-sm font-medium text-[#3E3B3B]">{flag.reason}</p>
      <p className="border-l-2 border-[#D7D7D7] pl-2 text-sm italic text-[#605E5E] wrap-break-word">“{flag.message}”</p>
      {flag.status === "new" ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className={inputClass} placeholder="Note (optional), e.g. Called the patient, advised A&E" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          <Button type="button" size="sm" width="w-full sm:w-auto" className="shrink-0 px-4" content={busy ? "Saving…" : "Mark reviewed"} disabled={busy} onClick={review} />
        </div>
      ) : (
        <p className="text-xs text-[#757575]">
          Reviewed{flag.reviewedBy ? ` by ${flag.reviewedBy.FirstName} ${flag.reviewedBy.LastName}` : ""}
          {flag.reviewedAt ? `, ${formatMessageTime(flag.reviewedAt)}` : ""}
          {flag.reviewNote ? `: ${flag.reviewNote}` : ""}
        </p>
      )}
    </li>
  );
}

// Messages, bookings and AI chats the safety check flagged as urgent, from
// every patient. Doctors see their own patients' alerts in their portal.
export default function SafetyAlerts() {
  const [view, setView] = useState("Open");
  const load = useCallback(() => adminService.listFlags(view === "Open" ? "new" : "reviewed"), [view]);
  const flags = useApiQuery(load, "Couldn't load alerts");
  const refresh = () => flags.refetch().catch(() => {});

  return (
    <div className="w-full">
      <PageHeader title="Safety alerts" description="Patient messages, bookings and AI chats that sounded urgent. Review each one and note what was done." />
      <Tabs
        tabs={[
          { key: "Open", label: "Open", appointment: view === "Open" ? flags.data?.length ?? 0 : 0 },
          { key: "Reviewed", label: "Reviewed", appointment: view === "Reviewed" ? flags.data?.length ?? 0 : 0 },
        ]}
        activeTab={view}
        setActiveTab={setView}
      />
      <div className="mt-6">
        {!flags.data ? (
          <p className="py-10 text-center text-[#707070]">{flags.error ?? "Loading alerts…"}</p>
        ) : flags.data.length === 0 ? (
          <div className="rounded-xl border border-[#D7D7D7] bg-white">
            <EmptyState icon={<ShieldCheck size={28} />} title={view === "Open" ? "No open alerts" : "Nothing reviewed yet"} description="Urgent messages, bookings and AI chats will show here." />
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {flags.data.map((f) => (
              <FlagCard key={f._id} flag={f} onReviewed={refresh} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
