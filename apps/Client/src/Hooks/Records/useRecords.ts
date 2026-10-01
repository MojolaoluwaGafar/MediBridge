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

// Downloads a record's PDF. Tracks which record is downloading so only that
// card's button shows progress.
export function useDownloadRecord() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = useCallback(async (record: IMedicalRecord) => {
    setDownloadingId(record._id);
    try {
      const blob = await recordService.downloadPdf(record._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${record.title}.pdf`;
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
  }, []);

  return { download, downloadingId };
}
