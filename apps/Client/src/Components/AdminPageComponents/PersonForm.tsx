import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";
import type { IPerson, IPersonPayload } from "../../types/admin";
import { apiErrorMessage, apiFieldErrors } from "../../utils/apiError";
import { inputClass } from "../../utils/formStyles";
import { Field, FormActions, Modal } from "./ui";

type Props = {
  title: string;
  subtitle?: string;
  // "Patient ID", "Staff ID"
  idLabel: string;
  // Editing an existing person: no ID field, and only changed values are sent.
  initial?: IPerson;
  submitLabel: string;
  onSubmit: (payload: IPersonPayload) => Promise<void>;
  onClose: () => void;
};

const EMPTY: IPersonPayload = { userId: "", firstname: "", lastname: "", email: "", phone: "" };

// Registers a person (patient, doctor login or admin) or edits their details.
// Nobody's password is set here: new people activate their own account.
export default function PersonForm({ title, subtitle, idLabel, initial, submitLabel, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<IPersonPayload>(
    initial ? { firstname: initial.firstname, lastname: initial.lastname, email: initial.email, phone: initial.phone } : EMPTY
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof IPersonPayload) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.length) setErrors(Object.fromEntries(fields.map((f) => [f.field, f.message])));
      else setFormError(apiErrorMessage(err, "Couldn't save. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Modal
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        busy={busy}
        footer={<FormActions busy={busy} label={submitLabel} onCancel={onClose} />}
      >
        {!initial && (
          <Field label={idLabel} hint="Leave empty to generate one" error={errors.userId}>
            <input className={inputClass} value={values.userId} onChange={set("userId")} maxLength={20} />
          </Field>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstname}>
            <input className={inputClass} value={values.firstname} onChange={set("firstname")} required maxLength={60} />
          </Field>
          <Field label="Last name" error={errors.lastname}>
            <input className={inputClass} value={values.lastname} onChange={set("lastname")} required maxLength={60} />
          </Field>
        </div>
        <Field label="Email address" error={errors.email}>
          <input className={inputClass} type="email" value={values.email} onChange={set("email")} required />
        </Field>
        <Field label="Phone number" hint="Used with the email to verify their identity" error={errors.phone}>
          <input className={inputClass} type="tel" value={values.phone} onChange={set("phone")} required placeholder="0803 123 4567" />
        </Field>
        {!initial && (
          <p className="flex items-start gap-2 rounded-lg bg-[#F5F7FA] p-3 text-sm text-[#605E5E]">
            <Info size={16} className="mt-0.5 shrink-0" />
            They activate their own account on the “Activate Account” page using this ID, email and phone number. A code
            is sent to them and they choose their own password; you never see it.
          </p>
        )}
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
      </Modal>
    </form>
  );
}
