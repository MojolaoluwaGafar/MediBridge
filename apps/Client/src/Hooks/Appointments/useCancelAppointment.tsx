import { useState } from "react";
import ConfirmDialog from "../../Components/PortalComponents/ConfirmDialog";
import { appointmentService } from "../../API/services/appointmentService";
import { apiErrorMessage } from "../../utils/apiError";
import { formatDateString } from "../../utils/formatDate";
import { showToast } from "../../utils/toastHelper";
import type { IAppointment } from "../../types/appointment";

// Cancelling asks first, then tells the patient how it went. `onCancelled`
// refreshes whichever list owns the appointment. Render `dialog` anywhere.
export function useCancelAppointment(onCancelled: () => void) {
  const [pending, setPending] = useState<IAppointment | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await appointmentService.cancelAppointment(pending._id);
      showToast("Appointment cancelled");
      onCancelled();
      setPending(null);
    } catch (err) {
      showToast(apiErrorMessage(err, "We couldn't cancel this appointment. Please try again."), "error");
    } finally {
      setBusy(false);
    }
  };

  const dialog = pending ? (
    <ConfirmDialog
      title="Cancel this appointment?"
      message={`Your appointment with ${pending.doctor.docName} on ${formatDateString(pending.date)} at ${pending.time} will be cancelled and the slot given to someone else.`}
      confirmLabel="Cancel appointment"
      cancelLabel="Keep appointment"
      tone="danger"
      busy={busy}
      onConfirm={confirm}
      onCancel={() => setPending(null)}
    />
  ) : null;

  return { requestCancel: setPending, dialog };
}
