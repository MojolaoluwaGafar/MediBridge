import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useApiQuery } from "../Api/useApiQuery";
import { usePolling } from "../Portal/usePolling";
import { messageService } from "../../API/services/messageService";
import type { IContact, IDirectMessage, IGetConversationRes, ISafetyNotice } from "../../types/conversation";
import type { ApiErrorResponse } from "../../types/apiReqRes";

const LIST_REFRESH_MS = 30_000;
const OPEN_CONVERSATION_REFRESH_MS = 10_000;

export function useConversations() {
  const { data, loading, error, refetch, isFetched } = useApiQuery(
    messageService.getConversations,
    "Failed to load your conversations"
  );

  // A refresh can overlap one already running; that is harmless, so ignore it.
  const refresh = useCallback(() => {
    refetch().catch(() => {});
  }, [refetch]);

  usePolling(refresh, LIST_REFRESH_MS);

  return {
    conversations: data?.conversations ?? [],
    loading: loading && !isFetched,
    error: isFetched ? null : error,
    refresh,
  };
}

const errorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? data?.error ?? fallback;
  }
  return fallback;
};

// One open conversation: loads it, checks for new messages every few seconds,
// and sends messages. `onChange` lets the list refresh its previews.
// Each instance serves one contact: render the pane with key={contactId} so
// switching conversations starts fresh instead of showing the old one.
export function useConversation(contactId: string, onChange?: () => void) {
  const [contact, setContact] = useState<IContact | null>(null);
  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [safetyNotice, setSafetyNotice] = useState<ISafetyNotice | null>(null);

  const apply = useCallback((res: IGetConversationRes) => {
    setContact(res.contact);
    setMessages(res.messages);
  }, []);

  useEffect(() => {
    let active = true;
    messageService
      .getConversation(contactId)
      .then((res) => {
        if (!active) return;
        apply(res);
        // Opening a conversation marks it read, so the list's unread count changes.
        onChange?.();
      })
      .catch((err) => active && setError(errorMessage(err, "Failed to load this conversation")))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // onChange is a refresh callback; re-running when it changes would refetch for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, apply]);

  // Background checks for new messages stay quiet on failure; the next one retries.
  usePolling(() => {
    messageService.getConversation(contactId).then(apply).catch(() => {});
  }, OPEN_CONVERSATION_REFRESH_MS);

  const send = useCallback(
    async (body: string) => {
      if (!body.trim() || sending) return false;
      setSending(true);
      try {
        const res = await messageService.sendMessage({ contactId, body: body.trim() });
        setMessages((current) => [...current, res.message]);
        setSafetyNotice(
          res.safetyMessage && res.urgency !== "routine" ? { level: res.urgency, message: res.safetyMessage } : null
        );
        setError(null);
        onChange?.();
        return true;
      } catch (err) {
        setSafetyNotice(null);
        setError(errorMessage(err, "Your message wasn't sent. Please try again."));
        return false;
      } finally {
        setSending(false);
      }
    },
    [contactId, sending, onChange]
  );

  return { contact, messages, loading, error, sending, safetyNotice, send };
}
