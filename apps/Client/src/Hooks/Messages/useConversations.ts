import { useCallback, useState } from "react";
import { conversationService } from "../../API/services/conversationService";
import { getApiErrorMessage } from "../../utils/apiError";
import { usePolling } from "../Api/usePolling";
import type {
  IConversationMessage,
  IConversationSummary,
} from "../../types/conversation";

const LIST_REFRESH_MS = 30_000;

const byLatest = (a: IConversationSummary, b: IConversationSummary) =>
  (b.lastMessage ? Date.parse(b.lastMessage.createdAt) : 0) -
  (a.lastMessage ? Date.parse(a.lastMessage.createdAt) : 0);

// The conversation list (one per doctor the patient can message).
export function useConversations() {
  const [conversations, setConversations] = useState<IConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await conversationService.getConversations();
      setConversations(data.conversations);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your conversations."));
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(refresh, LIST_REFRESH_MS);

  // Local updates so the list reacts at once, without waiting for the next refresh.
  const markRead = useCallback((contactId: string) => {
    setConversations((list) =>
      list.map((c) => (c.contact.id === contactId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const showLatestMessage = useCallback(
    (contactId: string, message: IConversationMessage) => {
      setConversations((list) =>
        list
          .map((c) => (c.contact.id === contactId ? { ...c, lastMessage: message } : c))
          .sort(byLatest)
      );
    },
    []
  );

  return { conversations, loading, error, refresh, markRead, showLatestMessage };
}
