import { useEffect } from "react";
import { X, Download } from "lucide-react";
import Button from "../../Button";
import { RECORD_TYPE_LABELS, type IMedicalRecord } from "../../../types/record";
import { formatLongDate } from "../../../utils/formatDate";

type Props = {
  record: IMedicalRecord;
  downloading: boolean;
  onDownload: (record: IMedicalRecord) => void;
  onClose: () => void;
};

export default function RecordDetailsModal({ record, downloading, onDownload, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const details: [string, string][] = [
    ["Date of visit", formatLongDate(record.visitDate)],
    ["Department", record.department],
    ["Doctor", record.doctor?.docName ?? "Not recorded"],
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
          {record.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="fontOutfit font-medium text-[#28574E]">{section.heading}</h3>
              <p className="whitespace-pre-line text-[#141313]">{section.body}</p>
            </section>
          ))}
        </div>

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
                {downloading ? "Saving…" : "Download PDF"}
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
