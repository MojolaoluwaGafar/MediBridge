import api from "../index";
import type {
  IAiChatPayload,
  IAiChatResponse,
  IAiChatSessionsRes,
  IAiChatSessionRes,
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

  async getSessions(): Promise<IAiChatSessionsRes> {
    const { data } = await api.get<IAiChatSessionsRes>("/api/aiChat/sessions");
    return data;
  },

  async getSession(sessionId: string): Promise<IAiChatSessionRes> {
    const { data } = await api.get<IAiChatSessionRes>(
      `/api/aiChat/sessions/${sessionId}`
    );
    return data;
  },
};
