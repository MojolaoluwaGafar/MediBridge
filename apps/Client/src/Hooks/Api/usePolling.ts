import { useEffect, useRef } from "react";

// Calls `task` now, then every `intervalMs` while the tab is visible, and again
// as soon as the tab comes back into view. Used for messages until the server
// can push updates (see docs/decisions/patient-portal.md).
export function usePolling(task: () => unknown, intervalMs: number, enabled = true) {
  const taskRef = useRef(task);

  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      if (document.visibilityState === "visible") void taskRef.current();
    };

    run();
    const timer = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
    };
  }, [intervalMs, enabled]);
}
