import { useApiQuery } from "../Api/useApiQuery";
import { appointmentService } from "../../API/services/appointmentService";

export function useAppointments() {
  const {
    data,
    loading,
    error,
    refetch,
    setData,
  } = useApiQuery(
    appointmentService.getAppointments,
    "Failed to fetch appointments"
  );

  return {
    appointments: data?.appointments ?? [],
    fetchAppointments: refetch,
    setAppointments: setData,
    loading,
    error,
  };
}