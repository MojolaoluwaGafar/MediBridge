import { useCallback, useState } from "react";
import { useApiQuery } from "../Api/useApiQuery";
import { recordService } from "../../API/services/recordService";
import { showToast } from "../../utils/toastHelper";
import type { IMedicalRecord } from "../../types/record";

export function useRecords() {
  const { data, loading, error, refetch, isFetched } = useApiQuery(
    recordService.getRecords,
    "Failed to load your medical records"
  );

  return {
    records: data?.records ?? [],
    loading: loading || (!isFetched && !error),
    error,
    refetch,
  };
}

type DownloadableRecord = Pick<IMedicalRecord, "_id" | "title">;
const patientPdf = (record: DownloadableRecord) => recordService.downloadPdf(record._id);

// Downloads a record's PDF. Tracks which record is downloading so only that
// card's button shows progress. The doctor portal passes its own fetcher for
// records a patient has shared.
export function useDownloadRecord(fetchPdf: (record: DownloadableRecord) => Promise<Blob> = patientPdf) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = useCallback(async (record: DownloadableRecord) => {
    setDownloadingId(record._id);
    try {
      const blob = await fetchPdf(record);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Staff uploads can be images; name the file after what it really is.
      const extension = ({ "image/png": "png", "image/jpeg": "jpg" } as Record<string, string>)[blob.type] ?? "pdf";
      link.download = `${record.title}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Give the browser a moment to start the download before freeing it.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      showToast("We couldn't download this record. Please try again.", "error");
    } finally {
      setDownloadingId(null);
    }
  }, [fetchPdf]);

  return { download, downloadingId };
}
