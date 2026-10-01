import { useEffect } from "react";
import Button from "../Button";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  // "danger" for things that can't be undone, like cancelling an appointment.
  tone?: "default" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Asks before an action that can't easily be undone.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Keep it",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && !busy && onCancel();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && onCancel()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-md rounded-xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="fontOutfit text-xl font-medium">{title}</h2>
        <p id="confirm-message" className="pt-2 text-[#605E5E]">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" size="sm" variant="outline" width="w-full sm:w-auto" content={cancelLabel} onClick={onCancel} disabled={busy} />
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`h-10 w-full rounded-md px-4 text-sm text-white fontOutfit disabled:opacity-50 sm:w-auto ${
              tone === "danger" ? "bg-red-700 hover:bg-red-800" : "bg-[#28574E] hover:bg-[#4f8379]"
            }`}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
