import api from "../index";
import type {
  IAiChatPayload,
  IAiChatResponse,
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
};