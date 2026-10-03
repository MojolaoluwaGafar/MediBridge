import { useState } from "react";
import Button from "../../Button";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import type { IMedicalRecord } from "../../../types/record";
import { apiErrorMessage } from "../../../utils/apiError";
import { showToast } from "../../../utils/toastHelper";

type Props = {
  recordId: string;
  onAdded: (record: IMedicalRecord) => void;
};

// Shown under a record the doctor wrote. Records aren't edited once the patient
// can see them; corrections and later findings go in a dated addendum.
export default function AddendumForm({ recordId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const record = await doctorPortalService.addAddendum(recordId, body.trim());
      showToast("Addendum added", "success");
      setBody("");
      setOpen(false);
      onAdded(record);
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't add the addendum"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <div className="mb-5 border-t border-[#D9D9D9] pt-4">
        <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-[#28574E] hover:underline">
          + Add an addendum
        </button>
        <p className="text-xs text-[#757575]">To correct or add to this record. The original text stays as it is.</p>
      </div>
    );
  }

  return (
    <div className="mb-5 space-y-2 border-t border-[#D9D9D9] pt-4">
      <label htmlFor="addendum" className="text-sm font-medium">Addendum</label>
      <textarea
        id="addendum"
        value={body}
        rows={3}
        maxLength={3000}
        onChange={(event) => setBody(event.target.value)}
        placeholder="e.g. Correction: dosage should read 10 mg, not 5 mg."
        className="w-full rounded-md border border-[#D9D9D9] px-3 py-2 text-sm focus:outline-none focus:border-[#28574E]"
      />
      <p className="text-xs text-[#757575]">It's added with today's date and time, and the patient will see it.</p>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="outline" width="w-auto" content="Cancel" onClick={() => setOpen(false)} disabled={saving} />
        <Button type="button" size="sm" width="w-auto" content={saving ? "Saving…" : "Add addendum"} disabled={saving || !body.trim()} onClick={save} />
      </div>
    </div>
  );
}
