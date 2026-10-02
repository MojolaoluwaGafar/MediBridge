import {
  isPatientTab,
  type PatientTabKey,
} from "../../Components/PatientPageComponents/PatientTabs";
import { usePortalTab } from "./usePortalTab";

export function usePatientTab() {
  return usePortalTab<PatientTabKey>(isPatientTab, "dashboard");
}
