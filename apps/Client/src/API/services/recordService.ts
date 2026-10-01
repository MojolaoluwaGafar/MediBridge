import api from "../index";
import type { IGetRecordsRes } from "../../types/apiReqRes";

export const recordService = {
  async getRecords(): Promise<IGetRecordsRes> {
    const { data } = await api.get<IGetRecordsRes>("/api/records");
    return data;
  },

  // The PDF is behind auth, so it is fetched as a blob (a plain link could not
  // send the Authorization header) and handed to downloadBlob.
  async downloadRecordPdf(id: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/api/records/${id}/pdf`, {
      responseType: "blob",
    });
    return data;
  },
};
