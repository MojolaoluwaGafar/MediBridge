import { useCallback, useEffect, useRef, useState } from "react";
import { conversationService } from "../../API/services/conversationService";
import { getApiErrorMessage } from "../../utils/apiError";
import { usePolling } from "../Api/usePolling";
import type {
  IConversationContact,
  IConversationMessage,
} from "../../types/conversation";

const THREAD_REFRESH_MS = 10_000;

// One open conversation. Polls for the doctor's replies while it is open.
// Mount it once per contact (key={contactId}) so nothing leaks between threads.
export function useConversation(contactId: string | null) {
  const [contact, setContact] = useState<IConversationContact | null>(null);
  const [messages, setMessages] = useState<IConversationMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(contactId));
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);

  // Ignores responses for a conversation the user has already switched away
  // from. (Callers should also key the component by contact so state resets.)
  const currentId = useRef(contactId);
  useEffect(() => {
    currentId.current = contactId;
  }, [contactId]);

  const load = useCallback(async () => {
    if (!contactId) return;
    try {
      const data = await conversationService.getConversation(contactId);
      if (currentId.current !== contactId) return;
      setContact(data.contact);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      if (currentId.current !== contactId) return;
      setError(getApiErrorMessage(err, "Couldn't load this conversation."));
    } finally {
      if (currentId.current === contactId) setLoading(false);
    }
  }, [contactId]);

  usePolling(load, THREAD_REFRESH_MS, Boolean(contactId));

  const send = useCallback(
    async (body: string): Promise<IConversationMessage | null> => {
      if (!contactId) return null;
      setSending(true);
      try {
        const data = await conversationService.sendMessage(contactId, body);
        if (currentId.current === contactId) {
          setMessages((list) => [...list, data.message]);
          setSafetyMessage(data.safetyMessage ?? null);
        }
        return data.message;
      } catch (err) {
        setError(getApiErrorMessage(err, "Your message wasn't sent. Please try again."));
        return null;
      } finally {
        setSending(false);
      }
    },
    [contactId]
  );

  return { contact, messages, loading, error, sending, send, safetyMessage };
}
