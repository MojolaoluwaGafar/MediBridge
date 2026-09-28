import { useCallback, useState } from "react";
import type { IAppointment } from "../../types/appointment";

export function useAppointmentModals() {
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);

  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<IAppointment | null>(null);

  const [appointmentToCancel, setAppointmentToCancel] =
    useState<IAppointment | null>(null);

  const handleView = useCallback((appointment: IAppointment) => {
    setSelectedAppointment(appointment);
  }, []);

  const handleReschedule = useCallback(
    (appointment: IAppointment) => {
      setAppointmentToReschedule(appointment);
    },
    []
  );

  const handleCancel = useCallback(
    (appointment: IAppointment) => {
      setAppointmentToCancel(appointment);
    },
    []
  );

  return {
    selectedAppointment,
    setSelectedAppointment,

    appointmentToReschedule,
    setAppointmentToReschedule,

    appointmentToCancel,
    setAppointmentToCancel,

    handleView,
    handleReschedule,
    handleCancel,
  };
}