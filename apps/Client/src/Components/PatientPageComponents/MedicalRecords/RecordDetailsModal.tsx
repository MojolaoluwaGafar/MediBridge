import { useEffect, type ReactNode } from "react";
import { X, Download, Paperclip } from "lucide-react";
import Button from "../../Button";
import { RECORD_TYPE_LABELS, type IMedicalRecord } from "../../../types/record";
import { formatLongDate } from "../../../utils/formatDate";

type Props = {
  record: IMedicalRecord;
  downloading: boolean;
  onDownload: (record: IMedicalRecord) => void;
  onClose: () => void;
  // Extra content above the buttons, e.g. the doctor's addendum form.
  children?: ReactNode;
};

export default function RecordDetailsModal({ record, downloading, onDownload, onClose, children }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const details: [string, string][] = [
    ["Date of visit", formatLongDate(record.visitDate)],
    ["Department", record.department],
    record.doctor ? ["Doctor", record.doctor.docName] : ["Added by", record.attachment ? "Hospital records office" : "Not recorded"],
    ["Record type", RECORD_TYPE_LABELS[record.type]],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-title"
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-xl bg-white p-6 sm:max-w-2xl sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="record-title" className="fontOutfit text-xl font-medium">{record.title}</h2>
            <p className="text-sm text-[#605E5E]">{RECORD_TYPE_LABELS[record.type]}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 border-y border-[#D9D9D9] py-5 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-[#757575]">{label}</dt>
              <dd className="fontOutfit">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-5 py-5">
          {record.summary && (
            <section>
              <h3 className="fontOutfit font-medium text-[#28574E]">Summary</h3>
              <p className="whitespace-pre-line text-[#141313]">{record.summary}</p>
            </section>
          )}
          {record.attachment && (
            <section className="flex items-center gap-3 rounded-lg border border-[#D9D9D9] p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E0F8F3] text-[#28574E]">
                <Paperclip size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{record.attachment.originalName}</span>
                <span className="block text-xs text-[#757575]">
                  {record.attachment.contentType === "application/pdf" ? "PDF" : "Image"} ·{" "}
                  {Math.max(1, Math.round(record.attachment.bytes / 1024))} KB · uploaded by the hospital
                </span>
              </span>
            </section>
          )}
          {record.sections.map((section, index) => (
            <section key={index}>
              <h3 className="fontOutfit font-medium text-[#28574E]">{section.heading}</h3>
              <p className="whitespace-pre-line text-[#141313]">{section.body}</p>
            </section>
          ))}
        </div>

        {children}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" size="sm" variant="outline" width="w-full sm:w-32" content="Close" onClick={onClose} />
          <Button
            type="button"
            size="sm"
            width="w-full sm:w-40"
            disabled={downloading}
            onClick={() => onDownload(record)}
            content={
              <>
                <Download size={16} />
                {downloading ? "Saving…" : record.attachment ? "Download file" : "Download PDF"}
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
