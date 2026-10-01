import api from "../index";
import type { IGetRecordsRes } from "../../types/record";

export const recordService = {
  async getRecords(): Promise<IGetRecordsRes> {
    const { data } = await api.get<IGetRecordsRes>("/api/records");
    return data;
  },

  // Fetched as a blob (not a plain link) so the request carries the auth
  // header and the PDF never sits at a shareable URL.
  async downloadPdf(id: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/api/records/${id}/pdf`, {
      responseType: "blob",
    });
    return data;
  },
};
