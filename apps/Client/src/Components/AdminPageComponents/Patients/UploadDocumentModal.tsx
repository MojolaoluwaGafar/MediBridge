import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";
import { adminService } from "../../../API/services/adminService";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import type { IPerson, UploadRecordType } from "../../../types/admin";
import { apiErrorMessage, apiFieldErrors } from "../../../utils/apiError";
import { todayDateString } from "../../../utils/formatDate";
import { inputClass } from "../../../utils/formStyles";
import { showToast } from "../../../utils/toastHelper";
import { Field, FormActions, Modal } from "../ui";

const TYPES: { value: UploadRecordType; label: string }[] = [
  { value: "lab_result", label: "Lab result" },
  { value: "imaging", label: "Imaging report" },
  { value: "discharge_summary", label: "Discharge summary" },
];
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];

type Props = { patient: IPerson; onClose: () => void; onUploaded: () => void };

// Staff attach a document from another department to the patient's record.
// The patient (and any doctor they share records with) can then download it.
export default function UploadDocumentModal({ patient, onClose, onUploaded }: Props) {
  const departments = useApiQuery(adminService.listDepartments, "Couldn't load departments");
  const [type, setType] = useState<UploadRecordType>("lab_result");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [visitDate, setVisitDate] = useState(todayDateString());
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickFile = (picked: File | null) => {
    setErrors((e) => ({ ...e, file: "" }));
    if (picked && !ACCEPTED.includes(picked.type)) {
      setErrors((e) => ({ ...e, file: "Choose a PDF, JPG or PNG file" }));
      return setFile(null);
    }
    if (picked && picked.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, file: "Files must be smaller than 10 MB" }));
      return setFile(null);
    }
    setFile(picked);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return setErrors((e) => ({ ...e, file: "Choose a file to upload" }));
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      await adminService.uploadRecord(patient.id, { type, title: title.trim(), department, visitDate, summary: summary.trim() }, file);
      showToast("Document added. The patient can now see it.", "success");
      onUploaded();
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.length) setErrors(Object.fromEntries(fields.map((f) => [f.field, f.message])));
      else setFormError(apiErrorMessage(err, "Couldn't upload the document"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Modal
        title="Upload a document"
        subtitle={`For ${patient.firstname} ${patient.lastname} · ${patient.userId}`}
        onClose={onClose}
        busy={busy}
        footer={<FormActions busy={busy} label="Upload" onCancel={onClose} disabled={!file || !title.trim() || !department} />}
      >
        <Field label="Type of document" error={errors.type}>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as UploadRecordType)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Title" hint="What the patient will see, e.g. “Full blood count”" error={errors.title}>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Department" error={errors.department}>
            <select className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)} required>
              <option value="">Choose…</option>
              {(departments.data ?? []).map((d) => (
                <option key={d._id} value={d.field}>{d.field}</option>
              ))}
            </select>
          </Field>
          <Field label="Date of test or visit" error={errors.visitDate}>
            <input className={inputClass} type="date" value={visitDate} max={todayDateString()} onChange={(e) => setVisitDate(e.target.value)} required />
          </Field>
        </div>
        <Field label="Summary" hint="Optional. A line the patient sees above the file." error={errors.summary}>
          <textarea className={inputClass} rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={2000} />
        </Field>
        <Field label="File" hint="PDF, JPG or PNG, up to 10 MB" error={errors.file}>
          <input
            className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-[#E0F8F3] file:px-3 file:py-1 file:text-[#28574E]`}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <p className="flex items-start gap-2 rounded-lg bg-[#F5F7FA] p-3 text-sm text-[#605E5E]">
          <Info size={16} className="mt-0.5 shrink-0" />
          Check it's the right patient: they're notified and can download the document straight away.
        </p>
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
      </Modal>
    </form>
  );
}
