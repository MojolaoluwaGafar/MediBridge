import { useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  isPatientTab,
  type PatientTabKey,
} from "../../Components/PatientPageComponents/PatientTabs";

// The patient portal keeps the open tab in the URL (?tab=messages&doctor=...),
// so a refresh stays on the same page, the back button works, and any
// component can send the patient to another tab without passing callbacks down.
export function usePatientTab() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("tab");
  const activeTab: PatientTabKey = isPatientTab(requested) ? requested : "dashboard";

  // `replace` updates the URL without adding a history entry, for changes the
  // patient didn't navigate to (e.g. a new chat getting its ID).
  const goToTab = useCallback(
    (tab: PatientTabKey, extra: Record<string, string> = {}, { replace = false } = {}) => {
      setSearchParams({ tab, ...extra }, { replace });
      if (!replace) window.scrollTo({ top: 0 });
    },
    [setSearchParams]
  );

  return { activeTab, searchParams, goToTab };
}
