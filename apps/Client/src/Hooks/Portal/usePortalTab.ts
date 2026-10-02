import { useCallback } from "react";
import { useSearchParams } from "react-router";

// The portals keep the open tab in the URL (?tab=messages&doctor=...), so a
// refresh stays on the same page, the back button works, and any component
// can send the user to another tab without passing callbacks down.
export function usePortalTab<Tab extends string>(isTab: (key: string | null) => key is Tab, fallback: Tab) {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("tab");
  const activeTab: Tab = isTab(requested) ? requested : fallback;

  // `replace` updates the URL without adding a history entry, for changes the
  // user didn't navigate to (e.g. a new chat getting its ID).
  const goToTab = useCallback(
    (tab: Tab, extra: Record<string, string> = {}, { replace = false } = {}) => {
      setSearchParams({ tab, ...extra }, { replace });
      if (!replace) window.scrollTo({ top: 0 });
    },
    [setSearchParams]
  );

  return { activeTab, searchParams, goToTab };
}
