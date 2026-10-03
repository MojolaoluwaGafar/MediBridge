import { useState, type FormEvent } from "react";
import { Building2 } from "lucide-react";
import PageHeader from "../PortalComponents/PageHeader";
import EmptyState from "../PortalComponents/EmptyState";
import Button from "../Button";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { adminService } from "../../API/services/adminService";
import type { IAdminDepartment, IDepartmentPayload } from "../../types/admin";
import { apiErrorMessage, apiFieldErrors } from "../../utils/apiError";
import { inputClass } from "../../utils/formStyles";
import { showToast } from "../../utils/toastHelper";
import { Field, FormActions, Modal, Pill } from "./ui";

// Must match DEPARTMENT_ICONS on the server; the public site maps these names to icons.
const ICONS = ["Heart", "Brain", "Eye", "Bone", "Baby", "Venus", "Stethoscope", "Ambulance", "Activity", "ShieldPlus", "Smile", "Tooth", "FirstAid", "MentalHealth"];

function DepartmentForm({ initial, onClose, onSaved }: { initial?: IAdminDepartment; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<IDepartmentPayload>({
    field: initial?.field ?? "",
    category: initial?.category ?? "Medical",
    summary: initial?.summary ?? "",
    icon: initial?.icon ?? "Stethoscope",
    overview: initial?.details?.overview ?? "",
    services: initial?.details?.services ?? [],
  });
  const [servicesText, setServicesText] = useState((initial?.details?.services ?? []).join("\n"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof IDepartmentPayload, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);
    const payload = { ...values, services: servicesText.split("\n").map((s) => s.trim()).filter(Boolean) };
    try {
      if (initial) await adminService.updateDepartment(initial._id, payload);
      else await adminService.createDepartment(payload);
      showToast(initial ? "Department saved" : "Department added", "success");
      onSaved();
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.length) setErrors(Object.fromEntries(fields.map((f) => [f.field.split(".")[0], f.message])));
      else setFormError(apiErrorMessage(err, "Couldn't save the department"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Modal title={initial ? "Edit department" : "Add a department"} onClose={onClose} busy={busy} wide footer={<FormActions busy={busy} label={initial ? "Save" : "Add department"} onCancel={onClose} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" hint={initial ? "Renaming moves its doctors too" : undefined} error={errors.field}>
            <input className={inputClass} value={values.field} onChange={(e) => set("field", e.target.value)} maxLength={60} required />
          </Field>
          <Field label="Category" hint="e.g. Medical, Surgical, Women & Children" error={errors.category}>
            <input className={inputClass} value={values.category} onChange={(e) => set("category", e.target.value)} maxLength={40} required />
          </Field>
        </div>
        <Field label="Summary" hint="One line on the departments page" error={errors.summary}>
          <input className={inputClass} value={values.summary} onChange={(e) => set("summary", e.target.value)} maxLength={300} required />
        </Field>
        <Field label="Icon" error={errors.icon}>
          <select className={inputClass} value={values.icon} onChange={(e) => set("icon", e.target.value)}>
            {ICONS.map((icon) => (
              <option key={icon}>{icon}</option>
            ))}
          </select>
        </Field>
        <Field label="Overview" hint="Shown when a patient opens the department" error={errors.overview}>
          <textarea className={inputClass} rows={3} value={values.overview} onChange={(e) => set("overview", e.target.value)} maxLength={2000} required />
        </Field>
        <Field label="Services" hint="One per line" error={errors.services}>
          <textarea className={inputClass} rows={4} value={servicesText} onChange={(e) => setServicesText(e.target.value)} />
        </Field>
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
      </Modal>
    </form>
  );
}

export default function Departments() {
  const departments = useApiQuery(adminService.listDepartments, "Couldn't load departments");
  const [editing, setEditing] = useState<IAdminDepartment | "new" | null>(null);
  const refresh = () => departments.refetch().catch(() => {});

  return (
    <div className="w-full">
      {editing && (
        <DepartmentForm
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
      <PageHeader
        title="Departments"
        description="What patients see on the departments page and choose from when booking."
        action={<Button type="button" width="w-full sm:w-auto" className="px-5" content="Add department" onClick={() => setEditing("new")} />}
      />
      <div className="mt-6">
        {!departments.data ? (
          departments.error ? (
            <EmptyState icon={<Building2 size={28} />} title="We couldn't load departments" description={departments.error} />
          ) : (
            <p className="py-10 text-center text-[#707070]">Loading departments…</p>
          )
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.data.map((d) => (
              <li key={d._id} className="flex flex-col gap-3 rounded-xl border border-[#D7D7D7] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="fontOutfit text-lg font-medium">{d.field}</p>
                    <p className="text-xs text-[#757575]">{d.category}</p>
                  </div>
                  {d.acceptingDoctors === 0 ? <Pill tone="red">No bookable doctors</Pill> : <Pill tone="green">{d.acceptingDoctors} taking bookings</Pill>}
                </div>
                <p className="line-clamp-2 text-sm text-[#605E5E]">{d.summary}</p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-xs text-[#757575]">{d.doctors} doctor{d.doctors === 1 ? "" : "s"} · {d.details?.services?.length ?? 0} services</span>
                  <Button type="button" size="sm" width="w-auto" variant="outline" content="Edit" onClick={() => setEditing(d)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
