import { CalendarCheck, CalendarDays, Download } from "lucide-react";
import Button from "../../Button";
import type { IMedicalRecord } from "../../../types/record";
import { formatLongDate } from "../../../utils/formatDate";

type Props = {
  record: IMedicalRecord;
  downloading: boolean;
  onView: (record: IMedicalRecord) => void;
  onDownload: (record: IMedicalRecord) => void;
};

export default function RecordCard({ record, downloading, onView, onDownload }: Props) {
  const byline = [record.doctor?.docName, `${record.department} Department`].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[#E6E3E3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#EBEAEA]">
          <CalendarCheck size={20} color="#605E5E" />
        </span>

        <div className="min-w-0">
          <h2 className="fontOutfit text-base font-medium">{record.title}</h2>
          <p className="truncate text-sm text-[#605E5E]">{byline}</p>
          <p className="flex items-center gap-1.5 pt-1 text-sm text-[#141313]">
            <CalendarDays size={14} color="#605E5E" />
            {formatLongDate(record.visitDate)}
          </p>
        </div>
      </div>

      <div className="flex gap-3 sm:shrink-0">
        <Button
          type="button"
          size="sm"
          width="flex-1 sm:flex-none sm:w-28"
          content="View"
          onClick={() => onView(record)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          width="flex-1 sm:flex-none sm:w-28"
          disabled={downloading}
          ariaLabel={`Download ${record.title} as PDF`}
          onClick={() => onDownload(record)}
          content={
            <>
              <Download size={16} />
              {downloading ? "Saving…" : "PDF"}
            </>
          }
        />
      </div>
    </article>
  );
}
