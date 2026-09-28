import { useApiMutation } from "../Api/useApiMutation";
import { appointmentService } from "../../API/services/appointmentService";

export function useBookAppointment() {
  const {
    mutate,
    loading,
    error,
    success,
  } = useApiMutation(
    appointmentService.bookAppointment,
    "Failed to book appointment"
  );

  return {
    bookAppointment: mutate,
    loading,
    error,
    success,
  };
}