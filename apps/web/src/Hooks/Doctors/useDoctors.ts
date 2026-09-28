import { useApiQuery } from "../Api/useApiQuery";
import { doctorService } from "../../API/services/doctorService";

export function useDoctors() {
  const {
    data,
    loading,
    error,
    refetch,
    setData,
  } = useApiQuery(
    doctorService.getDoctors,
    "Failed to fetch doctors"
  );

  return {
    doctors: data?.doctors ?? [],
    fetchDoctors: refetch,
    setDoctors: setData,
    loading,
    error,
  };
}