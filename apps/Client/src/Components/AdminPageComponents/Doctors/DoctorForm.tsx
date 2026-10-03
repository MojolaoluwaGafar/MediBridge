import { useState, type FormEvent } from "react";
import { adminService } from "../../../API/services/adminService";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import type { IAdminDoctor, IDoctorPayload } from "../../../types/admin";
import { apiErrorMessage, apiFieldErrors } from "../../../utils/apiError";
import { inputClass } from "../../../utils/formStyles";
import { Field, FormActions, Modal } from "../ui";

const WEEKDAY_HOURS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({ day, start: "9:00 AM", end: "5:00 PM" }));

type Props = {
  initial?: IAdminDoctor;
  onClose: () => void;
  onSaved: (id: string) => void;
};

// Adds a doctor profile (who patients can book) or edits one.
export default function DoctorForm({ initial, onClose, onSaved }: Props) {
  const departments = useApiQuery(adminService.listDepartments, "Couldn't load departments");
  const [values, setValues] = useState<IDoctorPayload>({
    docName: initial?.docName ?? "Dr. ",
    department: initial?.department ?? "",
    YOE: initial?.YOE ?? 0,
    gender: initial?.gender ?? "female",
    about: initial?.about ?? "",
    availability: initial?.availability ?? true,
  });
  const [weekdayHours, setWeekdayHours] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof IDoctorPayload>(key: K, value: IDoctorPayload[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      const payload = { ...values, docName: values.docName.trim(), about: values.about.trim() };
      let id: string;
      if (initial) {
        await adminService.updateDoctor(initial._id, payload);
        id = initial._id;
      } else {
        id = await adminService.createDoctor({ ...payload, availableTime: weekdayHours ? WEEKDAY_HOURS : [] });
      }
      onSaved(id);
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.length) setErrors(Object.fromEntries(fields.map((f) => [f.field, f.message])));
      else setFormError(apiErrorMessage(err, "Couldn't save the doctor"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Modal
        title={initial ? "Edit doctor" : "Add a doctor"}
        subtitle={initial ? undefined : "Patients can book them once they have hours. Give them a login afterwards for the doctor portal."}
        onClose={onClose}
        busy={busy}
        footer={<FormActions busy={busy} label={initial ? "Save" : "Add doctor"} onCancel={onClose} disabled={!values.department} />}
      >
        <Field label="Name" hint="As patients will see it, e.g. Dr. Ada Obi" error={errors.docName}>
          <input className={inputClass} value={values.docName} onChange={(e) => set("docName", e.target.value)} maxLength={80} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Department" error={errors.department}>
            <select className={inputClass} value={values.department} onChange={(e) => set("department", e.target.value)} required>
              <option value="">Choose…</option>
              {(departments.data ?? []).map((d) => (
                <option key={d._id} value={d.field}>{d.field}</option>
              ))}
            </select>
          </Field>
          <Field label="Years of experience" error={errors.YOE}>
            <input className={inputClass} type="number" min={0} max={70} value={values.YOE} onChange={(e) => set("YOE", Number(e.target.value))} required />
          </Field>
        </div>
        <Field label="Gender" error={errors.gender}>
          <select className={inputClass} value={values.gender} onChange={(e) => set("gender", e.target.value as IDoctorPayload["gender"])}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
        <Field label="About" hint="A short bio patients see when choosing a doctor" error={errors.about}>
          <textarea className={inputClass} rows={3} value={values.about} onChange={(e) => set("about", e.target.value)} maxLength={1000} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#28574E]" checked={values.availability} onChange={(e) => set("availability", e.target.checked)} />
          Taking new bookings
        </label>
        {!initial && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[#28574E]" checked={weekdayHours} onChange={(e) => setWeekdayHours(e.target.checked)} />
            Start with weekday hours (Monday to Friday, 9 AM to 5 PM); adjust them afterwards
          </label>
        )}
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
      </Modal>
    </form>
  );
}
