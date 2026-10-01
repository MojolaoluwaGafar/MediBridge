import { useEffect, useRef } from "react";

// Calls `callback` every `intervalMs` while `enabled` and the tab is visible,
// and once more as soon as the patient comes back to the tab. Used for new
// messages until the app has a real-time channel.
export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.visibilityState === "visible") latest.current();
    };
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs, enabled]);
}
