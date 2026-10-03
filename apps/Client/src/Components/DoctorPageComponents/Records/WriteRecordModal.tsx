import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import Button from "../../Button";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import type { DoctorRecordType, IDoctorAppointment } from "../../../types/doctorPortal";
import { apiErrorMessage } from "../../../utils/apiError";
import { mediumDate, patientName } from "../../../utils/doctorFormat";
import { showToast } from "../../../utils/toastHelper";

// The sections each kind of record starts with. Any left empty are dropped.
const TEMPLATES: Record<DoctorRecordType, { label: string; headings: string[]; placeholder: string[] }> = {
  consultation: {
    label: "Consultation notes",
    headings: ["Presenting complaint", "Examination", "Assessment", "Plan"],
    placeholder: [
      "Why the patient came in, in their words",
      "Findings, vital signs",
      "Diagnosis or working impression",
      "Treatment, tests ordered, follow-up",
    ],
  },
  prescription: {
    label: "Prescription",
    headings: ["Medication", "Dosage and instructions", "Duration", "Notes for the patient"],
    placeholder: [
      "e.g. Amlodipine 5 mg tablets",
      "e.g. One tablet every morning with water",
      "e.g. 30 days, then review",
      "Side effects to watch for, when to come back",
    ],
  },
};

const defaultTitle = (type: DoctorRecordType, department: string) =>
  type === "consultation" ? `${department} consultation` : "Prescription";

type Props = {
  appointment: IDoctorAppointment;
  onClose: () => void;
  onSaved: () => void;
};

// A record for a visit that has happened. The patient sees it as soon as it's
// saved, and it can't be edited afterwards, only added to (addendum).
export default function WriteRecordModal({ appointment, onClose, onSaved }: Props) {
  const [type, setType] = useState<DoctorRecordType>("consultation");
  const [title, setTitle] = useState(defaultTitle("consultation", appointment.department));
  const [summary, setSummary] = useState("");
  const [bodies, setBodies] = useState<string[]>(["", "", "", ""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = TEMPLATES[type];
  const hasContent = bodies.some((b) => b.trim());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && !saving && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [saving, onClose]);

  const switchType = (next: DoctorRecordType) => {
    // Keep a title the doctor typed; replace the default one.
    if (title === defaultTitle(type, appointment.department)) setTitle(defaultTitle(next, appointment.department));
    setType(next);
    setBodies(["", "", "", ""]);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await doctorPortalService.writeRecord(appointment._id, {
        type,
        title: title.trim(),
        summary: summary.trim(),
        sections: template.headings.map((heading, i) => ({ heading, body: bodies[i].trim() })),
      });
      showToast("Record saved. The patient can now see it.", "success");
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save the record"));
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full rounded-md border border-[#D9D9D9] px-3 py-2 text-sm focus:outline-none focus:border-[#28574E]";

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => !saving && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-record-title"
        className="flex max-h-[92dvh] w-full flex-col rounded-t-xl bg-white sm:max-w-2xl sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E3E3] p-5">
          <div>
            <h2 id="write-record-title" className="fontOutfit text-xl font-medium">Write record</h2>
            <p className="text-sm text-[#605E5E]">
              {patientName(appointment)} · {appointment.department} · {mediumDate(appointment.date)}, {appointment.time}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <fieldset>
            <legend className="text-sm font-medium">Type of record</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(TEMPLATES) as DoctorRecordType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={type === key}
                  onClick={() => switchType(key)}
                  className={`h-10 rounded-md border text-sm font-medium transition ${
                    type === key ? "border-[#28574E] bg-[#E0F8F3] text-[#28574E]" : "border-[#D9D9D9] text-[#605E5E] hover:bg-gray-50"
                  }`}
                >
                  {TEMPLATES[key].label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} className={`mt-1 h-10 ${field}`} />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Summary <span className="font-normal text-[#757575]">(optional, shown first)</span></span>
            <textarea value={summary} maxLength={2000} rows={2} onChange={(e) => setSummary(e.target.value)} className={`mt-1 ${field}`} />
          </label>

          {template.headings.map((heading, i) => (
            <label key={`${type}-${heading}`} className="block">
              <span className="text-sm font-medium">{heading}</span>
              <textarea
                value={bodies[i]}
                maxLength={5000}
                rows={3}
                placeholder={template.placeholder[i]}
                onChange={(e) => setBodies((all) => all.map((b, j) => (j === i ? e.target.value : b)))}
                className={`mt-1 ${field}`}
              />
            </label>
          ))}
          <p className="text-xs text-[#757575]">Sections left empty won't appear on the record.</p>
        </div>

        <div className="space-y-3 border-t border-[#E6E3E3] p-5">
          <p className="flex items-start gap-2 rounded-lg bg-[#F5F7FA] p-3 text-sm text-[#605E5E]">
            <Info size={16} className="mt-0.5 shrink-0" />
            The patient can see and download this record as soon as you save it. Records can't be edited afterwards;
            you can add an addendum to correct or add to it.
          </p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" size="sm" variant="outline" width="w-full sm:w-auto" className="px-5" content="Cancel" onClick={onClose} disabled={saving} />
            <Button
              type="button"
              size="sm"
              width="w-full sm:w-auto"
              className="px-5"
              content={saving ? "Saving…" : "Save record"}
              disabled={saving || !title.trim() || !hasContent}
              onClick={save}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
