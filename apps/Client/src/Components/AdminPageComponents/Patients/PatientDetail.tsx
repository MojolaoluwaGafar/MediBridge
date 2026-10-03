import { useCallback, useState } from "react";
import { ArrowLeft, FileText, FileUp, Info, Mail, Paperclip, Phone, UserRound } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import EmptyState from "../../PortalComponents/EmptyState";
import ConfirmDialog from "../../PortalComponents/ConfirmDialog";
import Button from "../../Button";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { useDownloadRecord } from "../../../Hooks/Records/useRecords";
import { adminService } from "../../../API/services/adminService";
import type { IAdminRecord } from "../../../types/admin";
import { RECORD_TYPE_LABELS } from "../../../types/record";
import { STATUS_STYLES } from "../../../utils/appointmentStatus";
import { mediumDate } from "../../../utils/doctorFormat";
import { apiErrorMessage } from "../../../utils/apiError";
import { showToast } from "../../../utils/toastHelper";
import PersonForm from "../PersonForm";
import UploadDocumentModal from "./UploadDocumentModal";
import { ActivationPill, Pill } from "../ui";

type Props = { patientId: string; onBack: () => void };

export default function PatientDetail({ patientId, onBack }: Props) {
  const load = useCallback(() => adminService.getPatient(patientId), [patientId]);
  const query = useApiQuery(load, "Couldn't load this patient");
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<IAdminRecord | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  const refresh = useCallback(() => {
    query.refetch().catch(() => {});
  }, [query]);

  const fetchFile = useCallback((record: { _id: string }) => adminService.downloadRecord(patientId, record._id), [patientId]);
  const { download, downloadingId } = useDownloadRecord(fetchFile);

  const back = (
    <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-[#28574E] hover:underline">
      <ArrowLeft size={16} /> Back to patients
    </button>
  );

  const data = query.data;
  if (!data) {
    return (
      <div className="w-full space-y-4">
        {back}
        {query.error ? (
          <EmptyState icon={<UserRound size={28} />} title="We couldn't load this patient" description={query.error} />
        ) : (
          <p className="py-10 text-center text-[#707070]">Loading patient…</p>
        )}
      </div>
    );
  }

  const { patient, records, appointments } = data;

  const remove = async () => {
    if (!removing) return;
    setRemoveBusy(true);
    try {
      await adminService.deleteRecord(removing._id);
      showToast("Document removed", "success");
      setRemoving(null);
      refresh();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't remove the document"), "error");
    } finally {
      setRemoveBusy(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {editing && (
        <PersonForm
          title="Edit patient details"
          subtitle="Patients can't change these themselves; email and phone are used to recover their account."
          idLabel="Patient ID"
          initial={patient}
          submitLabel="Save details"
          onClose={() => setEditing(false)}
          onSubmit={async (payload) => {
            await adminService.updatePatient(patient.id, payload);
            showToast("Patient details saved", "success");
            setEditing(false);
            refresh();
          }}
        />
      )}
      {uploading && (
        <UploadDocumentModal
          patient={patient}
          onClose={() => setUploading(false)}
          onUploaded={() => {
            setUploading(false);
            refresh();
          }}
        />
      )}
      {removing && (
        <ConfirmDialog
          title="Remove this document?"
          message={`“${removing.title}” will be deleted from ${patient.firstname}'s records and can't be recovered. Use this for a document uploaded to the wrong patient or the wrong file.`}
          confirmLabel="Remove document"
          cancelLabel="Keep it"
          tone="danger"
          busy={removeBusy}
          onConfirm={remove}
          onCancel={() => setRemoving(null)}
        />
      )}

      {back}

      <section className="flex flex-col gap-5 rounded-xl border border-[#D7D7D7] bg-white p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={`${patient.firstname} ${patient.lastname}`} image={patient.img} size="xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="fontOutfit text-xl font-medium sm:text-2xl">{patient.firstname} {patient.lastname}</h1>
              <ActivationPill activated={patient.activated} />
            </div>
            <div className="mt-1 flex flex-col gap-1 text-sm text-[#605E5E] sm:flex-row sm:flex-wrap sm:gap-x-4">
              <span className="flex items-center gap-1.5"><UserRound size={14} /> {patient.userId}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> {patient.phone}</span>
              <span className="flex min-w-0 items-center gap-1.5"><Mail size={14} /> <span className="truncate">{patient.email}</span></span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" width="w-auto" variant="outline" content="Edit details" onClick={() => setEditing(true)} />
          <Button type="button" size="sm" width="w-auto" content={<><FileUp size={16} /> Upload document</>} onClick={() => setUploading(true)} />
        </div>
      </section>

      {!patient.activated && (
        <p className="flex items-start gap-2 rounded-xl border border-[#F2D19B] bg-[#FFF8EC] p-4 text-sm text-[#6B4A00]">
          <Info size={16} className="mt-0.5 shrink-0" />
          {patient.firstname} hasn't activated their account yet. On the “Activate Account” page they enter Patient ID{" "}
          <strong>{patient.userId}</strong>, this email and this phone number, then choose a password.
        </p>
      )}

      <section className="rounded-xl border border-[#D7D7D7] bg-white">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="fontOutfit text-lg font-medium">Medical records</h2>
          <span className="text-sm text-[#757575]">{records.length}</span>
        </div>
        {records.length === 0 ? (
          <p className="px-5 pb-5 pt-2 text-sm text-[#757575]">No records yet. Upload lab results, scans or discharge papers here; doctors add their own notes after visits.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#E6E3E3] border-t border-[#E6E3E3]">
            {records.map((r) => (
              <li key={r._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E0F8F3] text-[#28574E]">
                    {r.attachment ? <Paperclip size={18} /> : <FileText size={18} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className="block text-xs text-[#757575]">
                      {RECORD_TYPE_LABELS[r.type]} · {mediumDate(String(r.visitDate).slice(0, 10))} ·{" "}
                      {r.doctor ? r.doctor.docName : "Uploaded by staff"}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-3 pl-12 sm:pl-0">
                  <button type="button" onClick={() => download(r)} disabled={downloadingId === r._id} className="text-sm font-medium text-[#28574E] hover:underline disabled:opacity-50">
                    {downloadingId === r._id ? "Saving…" : "Download"}
                  </button>
                  {r.uploadedByStaff && (
                    <button type="button" onClick={() => setRemoving(r)} className="text-sm text-red-700 hover:underline">
                      Remove
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[#D7D7D7] bg-white">
        <h2 className="px-5 pt-5 fontOutfit text-lg font-medium">Appointments</h2>
        {appointments.length === 0 ? (
          <p className="px-5 pb-5 pt-2 text-sm text-[#757575]">No appointments yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#E6E3E3] border-t border-[#E6E3E3]">
            {appointments.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:px-5">
                <span className="w-40 font-medium">{mediumDate(a.date)}, {a.time}</span>
                <span className="min-w-0 flex-1 text-[#605E5E]">{a.doctor ?? "Doctor"} · {a.department}</span>
                {a.urgency !== "routine" && <Pill tone={a.urgency === "emergency" ? "red" : "amber"}>{a.urgency}</Pill>}
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[a.status].className}`}>{STATUS_STYLES[a.status].label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
