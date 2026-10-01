import { useEffect, useState } from "react";
import { doctorService } from "../../API/services/doctorService";
import { apiErrorMessage } from "../../utils/apiError";
import type { IDoctorSlot } from "../../types/apiReqRes";

interface Loaded {
  key: string;
  slots: IDoctorSlot[];
  error: string | null;
}

// Loads a doctor's slots for one date, refetching when the date changes.
// The server decides what is bookable (working hours, booked, already past),
// so the booking and reschedule screens always agree with it.
// `refreshKey`: change it to fetch again, e.g. after a "slot just taken" error.
export function useDoctorSlots(doctorId: string | undefined, date: string | null, appointmentId?: string, refreshKey = 0) {
  const key = doctorId && date ? `${doctorId}|${date}|${appointmentId ?? ""}|${refreshKey}` : "";
  const [loaded, setLoaded] = useState<Loaded>({ key: "", slots: [], error: null });

  useEffect(() => {
    if (!doctorId || !date) return;
    let active = true;

    doctorService
      .getSlots(doctorId, date, appointmentId)
      .then((res) => active && setLoaded({ key, slots: res.slots, error: null }))
      .catch((err) =>
        active && setLoaded({ key, slots: [], error: apiErrorMessage(err, "Couldn't load available times. Please try again.") })
      );

    return () => {
      active = false;
    };
  }, [key, doctorId, date, appointmentId]);

  // Until the answer for the current date arrives, show loading rather than
  // the previous date's slots.
  const current = key !== "" && loaded.key === key;
  return {
    slots: current ? loaded.slots : [],
    loading: key !== "" && !current,
    error: current ? loaded.error : null,
  };
}
