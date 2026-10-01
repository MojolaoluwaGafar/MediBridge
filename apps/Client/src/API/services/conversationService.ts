import api from "../index";
import type {
  IGetConversationsRes,
  IGetConversationRes,
  ISendConversationMessageRes,
} from "../../types/apiReqRes";

export const conversationService = {
  async getConversations(): Promise<IGetConversationsRes> {
    const { data } = await api.get<IGetConversationsRes>("/api/conversations");
    return data;
  },

  async getConversation(contactId: string): Promise<IGetConversationRes> {
    const { data } = await api.get<IGetConversationRes>(
      `/api/conversations/${contactId}`
    );
    return data;
  },

  async sendMessage(
    contactId: string,
    body: string
  ): Promise<ISendConversationMessageRes> {
    const { data } = await api.post<ISendConversationMessageRes>(
      `/api/conversations/${contactId}/messages`,
      { body }
    );
    return data;
  },
};
