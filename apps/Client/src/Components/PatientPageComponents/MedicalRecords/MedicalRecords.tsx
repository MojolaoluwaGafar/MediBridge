import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import SearchFilterBar, { type FilterOption } from "../../PortalComponents/SearchFilterBar";
import EmptyState from "../../PortalComponents/EmptyState";
import RecordCard from "./RecordCard";
import RecordDetailsModal from "./RecordDetailsModal";
import { useMedicalRecords } from "../../../Hooks/Records/useMedicalRecords";
import {
  RECORD_TYPE_LABELS,
  type IMedicalRecord,
  type RecordType,
} from "../../../types/record";
import { formatLongDate } from "../../../utils/formatDate";

const ALL = "all";

const FILTER_OPTIONS: FilterOption[] = [
  { value: ALL, label: "All" },
  ...(Object.entries(RECORD_TYPE_LABELS) as [RecordType, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];

// Everything a patient might type to find a record: doctor, department, type,
// title, and the date written out ("Thursday, July 2, 2026" and "July 2026").
function searchableText(record: IMedicalRecord) {
  const date = new Date(record.visitDate);
  const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const shortMonthYear = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return [
    record.title,
    record.department,
    record.doctor?.docName,
    RECORD_TYPE_LABELS[record.type],
    formatLongDate(record.visitDate),
    monthYear,
    shortMonthYear,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function MedicalRecords() {
  const { records, loading, error, downloadPdf, downloadingId } = useMedicalRecords();
  const [search, setSearch] = useState("");
  const [type, setType] = useState(ALL);
  const [openRecord, setOpenRecord] = useState<IMedicalRecord | null>(null);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter(
      (record) =>
        (type === ALL || record.type === type) &&
        (!term || searchableText(record).includes(term))
    );
  }, [records, search, type]);

  const renderList = () => {
    if (loading && !records.length) {
      return <p className="py-10 text-center text-[#707070]">Loading your records…</p>;
    }
    if (error) {
      return <p className="py-10 text-center text-red-600">{error}</p>;
    }
    if (!records.length) {
      return (
        <EmptyState
          icon={<FileText size={24} />}
          title="No Medical Records Yet"
          description="You don't have any clinical records available."
        />
      );
    }
    if (!visibleRecords.length) {
      return (
        <EmptyState
          icon={<FileText size={24} />}
          title="No matching records"
          description="Try a different search, or set the filter back to All."
        />
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {visibleRecords.map((record) => (
          <RecordCard
            key={record._id}
            record={record}
            onView={setOpenRecord}
            onDownload={downloadPdf}
            downloading={downloadingId === record._id}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {openRecord && (
        <RecordDetailsModal
          record={openRecord}
          onClose={() => setOpenRecord(null)}
          onDownload={downloadPdf}
          downloading={downloadingId === openRecord._id}
        />
      )}

      <PageHeader
        title="Medical Records"
        description="Your complete history of hospital visits and consultation summaries."
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={'Search by doctor, department, or date (e.g. "cardiology", "May 2026")'}
        filter={type}
        onFilterChange={setType}
        filterOptions={FILTER_OPTIONS}
      />

      {renderList()}
    </div>
  );
}
