import api from "../index";
import type { IAccountRes, IChangePasswordPayload } from "../../types/account";

export const accountService = {
  async getAccount(): Promise<IAccountRes> {
    const { data } = await api.get<IAccountRes>("/api/account");
    return data;
  },

  async changePassword(payload: IChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const { data } = await api.patch("/api/account/password", payload);
    return data;
  },

  async uploadPhoto(file: File): Promise<IAccountRes> {
    const form = new FormData();
    form.append("photo", file);
    // Let the browser set the multipart boundary instead of the JSON default.
    const { data } = await api.post<IAccountRes>("/api/account/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async removePhoto(): Promise<IAccountRes> {
    const { data } = await api.delete<IAccountRes>("/api/account/avatar");
    return data;
  },
};
