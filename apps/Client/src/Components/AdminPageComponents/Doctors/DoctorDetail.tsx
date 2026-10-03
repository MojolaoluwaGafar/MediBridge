import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Camera, Stethoscope } from "lucide-react";
import EmptyState from "../../PortalComponents/EmptyState";
import DoctorPhoto from "../../PortalComponents/DoctorPhoto";
import ConfirmDialog from "../../PortalComponents/ConfirmDialog";
import Button from "../../Button";
import Availability from "../../DoctorPageComponents/Availability/Availability";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { adminService } from "../../../API/services/adminService";
import { apiErrorMessage } from "../../../utils/apiError";
import { inputClass } from "../../../utils/formStyles";
import { showToast } from "../../../utils/toastHelper";
import PersonForm from "../PersonForm";
import DoctorForm from "./DoctorForm";
import { ActivationPill, Pill } from "../ui";

type Props = { doctorId: string; onBack: () => void };

export default function DoctorDetail({ doctorId, onBack }: Props) {
  const doctors = useApiQuery(adminService.listDoctors, "Couldn't load this doctor");
  const [editing, setEditing] = useState(false);
  const [creatingLogin, setCreatingLogin] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const refresh = () => doctors.refetch().catch(() => {});
  const doctor = doctors.data?.find((d) => d._id === doctorId);

  const back = (
    <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-[#28574E] hover:underline">
      <ArrowLeft size={16} /> Back to doctors
    </button>
  );

  if (!doctor) {
    return (
      <div className="w-full space-y-4">
        {back}
        {doctors.error || doctors.data ? (
          <EmptyState icon={<Stethoscope size={28} />} title="Doctor not found" description={doctors.error ?? "They may have been removed."} />
        ) : (
          <p className="py-10 text-center text-[#707070]">Loading doctor…</p>
        )}
      </div>
    );
  }

  const changePhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await adminService.uploadDoctorPhoto(doctor._id, file);
      showToast("Photo updated", "success");
      refresh();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't upload the photo"), "error");
    } finally {
      setBusy(false);
      if (photoInput.current) photoInput.current.value = "";
    }
  };

  const linkExisting = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setLinkError(null);
    try {
      await adminService.linkDoctorAccount(doctor._id, linkValue.trim());
      showToast("Login linked. They'll see the doctor portal next time they sign in.", "success");
      setLinkValue("");
      refresh();
    } catch (err) {
      setLinkError(apiErrorMessage(err, "Couldn't link that login"));
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    try {
      await adminService.unlinkDoctorAccount(doctor._id);
      showToast("Login unlinked", "success");
      setUnlinking(false);
      refresh();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't unlink the login"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {editing && <DoctorForm initial={doctor} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); showToast("Doctor saved", "success"); refresh(); }} />}
      {creatingLogin && (
        <PersonForm
          title="Create a portal login"
          subtitle={`For ${doctor.docName}. They activate it themselves and choose a password.`}
          idLabel="Staff ID"
          submitLabel="Create login"
          onClose={() => setCreatingLogin(false)}
          onSubmit={async (payload) => {
            const account = await adminService.createDoctorLogin(doctor._id, payload);
            showToast(`Login ${account.userId} created`, "success");
            setCreatingLogin(false);
            refresh();
          }}
        />
      )}
      {unlinking && (
        <ConfirmDialog
          title="Unlink this login?"
          message={`${doctor.docName} will lose access to the doctor portal. Their login keeps working as a patient account. You can link it again later.`}
          confirmLabel="Unlink"
          tone="danger"
          busy={busy}
          onConfirm={unlink}
          onCancel={() => setUnlinking(false)}
        />
      )}

      {back}

      <section className="flex flex-col gap-5 rounded-xl border border-[#D7D7D7] bg-white p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative">
            <DoctorPhoto name={doctor.docName} image={doctor.docImg} className="h-24 w-24 rounded-full text-2xl" />
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              disabled={busy}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#28574E] text-white hover:bg-[#4f8379]"
            >
              <Camera size={16} />
            </button>
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => changePhoto(e.target.files?.[0])} />
          </div>
          <div className="min-w-0">
            <h1 className="fontOutfit text-xl font-medium sm:text-2xl">{doctor.docName}</h1>
            <p className="text-sm text-[#605E5E]">{doctor.department} · {doctor.YOE} years' experience · {doctor.upcomingAppointments} upcoming appointments</p>
            <div className="mt-2">{doctor.availability ? <Pill tone="green">Taking bookings</Pill> : <Pill tone="gray">Not taking bookings</Pill>}</div>
          </div>
        </div>
        <Button type="button" size="sm" width="w-auto" variant="outline" content="Edit profile" onClick={() => setEditing(true)} />
      </section>

      <section className="rounded-xl border border-[#D7D7D7] bg-white p-4 sm:p-6">
        <h2 className="fontOutfit text-lg font-medium">Doctor portal login</h2>
        {doctor.account ? (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{doctor.account.userId}</span> · {doctor.account.email} <ActivationPill activated={doctor.account.activated} />
              </p>
              {!doctor.account.activated && (
                <p className="mt-1 text-[#605E5E]">
                  They activate it on the “Activate Account” page with Staff ID {doctor.account.userId}, this email and their phone number.
                </p>
              )}
            </div>
            <Button type="button" size="sm" width="w-auto" variant="outline" content="Unlink" onClick={() => setUnlinking(true)} />
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-[#605E5E]">
              {doctor.docName} has no login yet, so they can't use the doctor portal (schedule, patients, records, messages).
            </p>
            <Button type="button" size="sm" width="w-auto" content="Create a login" onClick={() => setCreatingLogin(true)} />
            <form onSubmit={linkExisting} className="flex flex-col gap-2 border-t border-[#E6E3E3] pt-4 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="text-sm font-medium">Or link an existing login</span>
                <span className="block text-xs text-[#757575]">Their User ID or email</span>
                <input className={`mt-1 ${inputClass}`} value={linkValue} onChange={(e) => setLinkValue(e.target.value)} />
              </label>
              <Button type="submit" size="sm" width="w-auto" variant="outline" content="Link" disabled={busy || !linkValue.trim()} />
            </form>
            {linkError && <p role="alert" className="text-sm text-red-700">{linkError}</p>}
          </div>
        )}
      </section>

      <Availability
        doctor={doctor}
        title="Weekly hours"
        description={`The hours patients can book ${doctor.docName}. Doctors with a login can also change these themselves.`}
        save={(payload) => adminService.setDoctorHours(doctor._id, payload)}
        onSaved={() => refresh()}
      />
    </div>
  );
}
