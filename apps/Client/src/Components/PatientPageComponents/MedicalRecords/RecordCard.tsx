import { CalendarCheck, CalendarDays, Download } from "lucide-react";
import type { IMedicalRecord } from "../../../types/record";
import { formatLongDate } from "../../../utils/formatDate";

type Props = {
  record: IMedicalRecord;
  onView: (record: IMedicalRecord) => void;
  onDownload: (record: IMedicalRecord) => void;
  downloading: boolean;
};

export default function RecordCard({ record, onView, onDownload, downloading }: Props) {
  const byline = [record.doctor?.docName, `${record.department} Department`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[#E6E3E3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5]">
          <CalendarCheck size={20} color="#605E5E" />
        </span>

        <div className="min-w-0">
          <h2 className="fontOutfit truncate text-base font-medium">{record.title}</h2>
          <p className="truncate text-sm text-[#605E5E]">{byline}</p>
          <p className="flex items-center gap-1.5 pt-1 text-sm text-[#141313]">
            <CalendarDays size={14} color="#605E5E" />
            {formatLongDate(record.visitDate)}
          </p>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 sm:flex">
        <button
          type="button"
          onClick={() => onView(record)}
          className="h-10 rounded-md bg-[#28574E] px-8 text-sm text-white transition-colors hover:bg-[#4f8379]"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onDownload(record)}
          disabled={downloading}
          aria-label={`Download ${record.title} as PDF`}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#28574E] px-6 text-sm text-[#28574E] transition-colors hover:bg-[#E3FDF7] disabled:cursor-wait disabled:opacity-60"
        >
          <Download size={16} />
          {downloading ? "Preparing…" : "PDF"}
        </button>
      </div>
    </article>
  );
}
