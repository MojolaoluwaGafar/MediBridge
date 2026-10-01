import api from "../index";
import type { IAccountRes } from "../../types/apiReqRes";
import type { IChangePasswordPayload } from "../../types/account";

export const accountService = {
  async getAccount(): Promise<IAccountRes> {
    const { data } = await api.get<IAccountRes>("/api/account");
    return data;
  },

  async updatePhone(phone: string): Promise<IAccountRes> {
    const { data } = await api.patch<IAccountRes>("/api/account", {
      PhoneNumber: phone,
    });
    return data;
  },

  async changePassword(
    payload: IChangePasswordPayload
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await api.patch("/api/account/password", payload);
    return data;
  },

  async uploadPhoto(file: File): Promise<IAccountRes> {
    const form = new FormData();
    form.append("photo", file);
    // Overrides the instance's JSON default; axios then lets the browser add
    // the multipart boundary.
    const { data } = await api.put<IAccountRes>("/api/account/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async removePhoto(): Promise<IAccountRes> {
    const { data } = await api.delete<IAccountRes>("/api/account/photo");
    return data;
  },
};
