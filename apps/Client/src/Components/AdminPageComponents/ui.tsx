import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import Button from "../Button";

// Small building blocks shared by the admin portal's forms and lists.

export function Modal({
  title,
  subtitle,
  onClose,
  busy = false,
  footer,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  busy?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92dvh] w-full flex-col rounded-t-xl bg-white sm:rounded-xl ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E3E3] p-5">
          <div className="min-w-0">
            <h2 className="fontOutfit text-xl font-medium">{title}</h2>
            {subtitle && <p className="text-sm text-[#605E5E]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-3 border-t border-[#E6E3E3] p-5 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="block text-xs text-[#757575]">{hint}</span>}
      <span className="mt-1 block">{children}</span>
      {error && <span role="alert" className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

export function FormActions({ busy, label, onCancel, disabled }: { busy: boolean; label: string; onCancel: () => void; disabled?: boolean }) {
  return (
    <>
      <Button type="button" size="sm" variant="outline" width="w-full sm:w-auto" className="px-5" content="Cancel" onClick={onCancel} disabled={busy} />
      <Button type="submit" size="sm" width="w-full sm:w-auto" className="px-5" content={busy ? "Saving…" : label} disabled={busy || disabled} />
    </>
  );
}

export function Pill({ tone, children }: { tone: "green" | "amber" | "red" | "gray" | "blue"; children: ReactNode }) {
  const tones = {
    green: "bg-[#E0F8F3] text-[#28574E]",
    amber: "bg-[#FFF4E0] text-[#8A5A00]",
    red: "bg-[#FDECEA] text-[#8C1D18]",
    gray: "bg-[#EBEBEB] text-[#3E3B3B]",
    blue: "bg-[#EAF2FF] text-[#1D4E89]",
  };
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function ActivationPill({ activated }: { activated: boolean }) {
  return activated ? <Pill tone="green">Active</Pill> : <Pill tone="amber">Not activated</Pill>;
}

export function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-sm text-[#605E5E]">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <span className="flex gap-2">
        <Button type="button" size="sm" variant="outline" width="w-auto" content="Previous" disabled={page <= 1} onClick={() => onPage(page - 1)} />
        <Button type="button" size="sm" variant="outline" width="w-auto" content="Next" disabled={page >= pages} onClick={() => onPage(page + 1)} />
      </span>
    </div>
  );
}
