import api from "../index";
import type {
  IGetConversationsRes,
  IGetConversationRes,
  ISendMessageRes,
} from "../../types/conversation";

export const messageService = {
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

  async sendMessage(payload: { contactId: string; body: string }): Promise<ISendMessageRes> {
    const { data } = await api.post<ISendMessageRes>(
      `/api/conversations/${payload.contactId}/messages`,
      { body: payload.body }
    );
    return data;
  },
};
