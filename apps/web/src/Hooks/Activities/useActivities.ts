import { useApiQuery } from "../Api/useApiQuery";
import { activityService } from "../../API/services/activityService";

export function useActivities() {
  const {
    data,
    loading,
    error,
    refetch,
    setData,
  } = useApiQuery(
    activityService.getActivities,
    "Failed to fetch activities"
  );

  return {
    activities: data?.activities ?? [],
    fetchActivities: refetch,
    setActivities: setData,
    loading,
    error,
  };
}