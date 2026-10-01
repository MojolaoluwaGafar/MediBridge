import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

// Centered dialog that closes on the backdrop, the X, or Escape.
export default function Modal({ title, onClose, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90dvh] w-full flex-col rounded-t-xl bg-white sm:max-w-xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E3E3] p-5">
          <h2 className="fontOutfit text-lg font-medium">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">{children}</div>

        {footer && <div className="border-t border-[#E6E3E3] p-5">{footer}</div>}
      </div>
    </div>
  );
}
