import { useCallback, useState } from "react";
import { useApiQuery } from "../Api/useApiQuery";
import { recordService } from "../../API/services/recordService";
import { downloadBlob } from "../../utils/downloadBlob";
import { getApiErrorMessage } from "../../utils/apiError";
import { showToast } from "../../utils/toastHelper";
import type { IMedicalRecord } from "../../types/record";

export function useMedicalRecords() {
  const { data, loading, error, refetch } = useApiQuery(
    recordService.getRecords,
    "Couldn't load your medical records."
  );

  // The record whose PDF is downloading, so only its button shows progress.
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadPdf = useCallback(async (record: IMedicalRecord) => {
    setDownloadingId(record._id);
    try {
      const blob = await recordService.downloadRecordPdf(record._id);
      downloadBlob(blob, `${record.title}.pdf`);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't download the PDF. Please try again."), "error");
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return {
    records: data?.records ?? [],
    loading,
    error,
    refetch,
    downloadPdf,
    downloadingId,
  };
}
