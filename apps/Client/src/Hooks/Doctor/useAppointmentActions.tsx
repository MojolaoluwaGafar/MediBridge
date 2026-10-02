import { useCallback, useState } from "react";
import { doctorPortalService } from "../../API/services/doctorPortalService";
import { CancelAppointmentDialog } from "../../Components/DoctorPageComponents/shared";
import type { IDoctorAppointment } from "../../types/doctorPortal";
import { apiErrorMessage } from "../../utils/apiError";
import { showToast } from "../../utils/toastHelper";

// Mark completed / cancel, with the cancel dialog, for any screen that lists
// a doctor's appointments. `onChanged` refreshes that screen afterwards.
export function useAppointmentActions(onChanged: () => void) {
  const [toCancel, setToCancel] = useState<IDoctorAppointment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const complete = useCallback(
    async (appointment: IDoctorAppointment) => {
      setBusyId(appointment._id);
      try {
        await doctorPortalService.completeAppointment(appointment._id);
        showToast("Marked as completed", "success");
        onChanged();
      } catch (err) {
        showToast(apiErrorMessage(err, "Couldn't update the appointment"), "error");
      } finally {
        setBusyId(null);
      }
    },
    [onChanged]
  );

  const confirmCancel = async (reason: string) => {
    if (!toCancel) return;
    setBusyId(toCancel._id);
    try {
      await doctorPortalService.cancelAppointment(toCancel._id, reason);
      showToast("Appointment cancelled. The patient has been told.", "success");
      setToCancel(null);
      onChanged();
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't cancel the appointment"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const dialog = toCancel ? (
    <CancelAppointmentDialog
      appointment={toCancel}
      busy={busyId === toCancel._id}
      onConfirm={confirmCancel}
      onClose={() => setToCancel(null)}
    />
  ) : null;

  return { complete, requestCancel: setToCancel, busyId, dialog };
}
