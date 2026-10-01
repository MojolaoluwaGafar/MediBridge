import api from "../index";
import type {
  IAiChatPayload,
  IAiChatResponse,
  IAiHistoryResponse,
} from "../../types/apiReqRes";

export const aiService = {
  async sendMessage(
    payload: IAiChatPayload
  ): Promise<IAiChatResponse> {
    const { data } = await api.post<IAiChatResponse>(
      "/api/aiChat",
      payload
    );

    return data;
  },

  // The signed-in user's latest conversation (empty for visitors).
  async getLatestSession(): Promise<IAiHistoryResponse> {
    const { data } = await api.get<IAiHistoryResponse>("/api/aiChat/latest");

    return data;
  },
};
