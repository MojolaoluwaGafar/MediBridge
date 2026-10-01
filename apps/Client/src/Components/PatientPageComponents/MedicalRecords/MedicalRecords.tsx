import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import RecordCard from "./RecordCard";
import RecordDetailsModal from "./RecordDetailsModal";
import { useRecords, useDownloadRecord } from "../../../Hooks/Records/useRecords";
import { RECORD_TYPE_LABELS, type IMedicalRecord, type RecordType } from "../../../types/record";
import { searchableDate } from "../../../utils/formatDate";

type TypeFilter = "all" | RecordType;

const searchTextFor = (record: IMedicalRecord) =>
  [
    record.title,
    record.department,
    record.doctor?.docName,
    RECORD_TYPE_LABELS[record.type],
    searchableDate(record.visitDate),
  ]
    .join(" ")
    .toLowerCase();

export default function MedicalRecords() {
  const { records, loading, error, refetch } = useRecords();
  const { download, downloadingId } = useDownloadRecord();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [openRecord, setOpenRecord] = useState<IMedicalRecord | null>(null);

  const visibleRecords = useMemo(() => {
    const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return records.filter((record) => {
      if (typeFilter !== "all" && record.type !== typeFilter) return false;
      const text = searchTextFor(record);
      return words.every((word) => text.includes(word));
    });
  }, [records, search, typeFilter]);

  const renderList = () => {
    if (loading) {
      return <p className="py-10 text-center text-[#707070]">Loading your records…</p>;
    }

    if (error) {
      return (
        <EmptyState
          icon={<FileText size={28} />}
          title="We couldn't load your records"
          description={error}
          action={
            <button type="button" onClick={() => refetch().catch(() => {})} className="text-[#28574E] font-medium underline">
              Try again
            </button>
          }
        />
      );
    }

    if (records.length === 0) {
      return (
        <EmptyState
          icon={<FileText size={28} />}
          title="No Medical Records Yet"
          description="You don't have any clinical records available."
        />
      );
    }

    if (visibleRecords.length === 0) {
      return (
        <EmptyState
          icon={<Search size={28} />}
          title="No matching records"
          description="Try a doctor's name, a department, or a month such as “May 2026”."
        />
      );
    }

    return (
      <div className="space-y-4">
        {visibleRecords.map((record) => (
          <RecordCard
            key={record._id}
            record={record}
            downloading={downloadingId === record._id}
            onView={setOpenRecord}
            onDownload={download}
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
          downloading={downloadingId === openRecord._id}
          onDownload={download}
          onClose={() => setOpenRecord(null)}
        />
      )}

      <PageHeader
        title="Medical Records"
        description="Your complete history of hospital visits and consultation summaries."
      />

      <div className="my-6 flex flex-col gap-4 rounded-xl border border-[#E6E3E3] bg-white p-4 sm:flex-row sm:gap-5 sm:p-5">
        <label className="min-w-0 flex-1">
          <span className="block pb-1 text-sm">Search</span>
          <span className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search color="#605E5E" size={16} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by doctor, department, or date (e.g. “cardiology”, “May 2026”)"
              className="h-10 w-full rounded-lg border border-[#E7E4E4] pl-9 pr-3 text-sm focus:outline-none focus:border-[#28574E]"
            />
          </span>
        </label>

        <label className="flex flex-col sm:w-48">
          <span className="pb-1 text-sm">Filter</span>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            className="h-10 rounded-md border border-[#E6E3E3] px-2 text-sm"
          >
            <option value="all">All</option>
            {Object.entries(RECORD_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {renderList()}
    </div>
  );
}
