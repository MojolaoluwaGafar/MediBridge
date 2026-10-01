import { useEffect, useRef, useState } from "react";
import { ArrowLeft, SendHorizontal, TriangleAlert } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import { useConversation } from "../../../Hooks/Messages/useConversation";
import type {
  IConversationContact,
  IConversationMessage,
} from "../../../types/conversation";
import { formatMessageStamp } from "../../../utils/formatDate";

const MAX_LENGTH = 2000;

type Props = {
  contactId: string;
  // From the list, so the header shows at once while the messages load.
  fallbackContact: IConversationContact | null;
  onBack: () => void;
  onOpened: (contactId: string) => void;
  onSent: (contactId: string, message: IConversationMessage) => void;
};

export default function ConversationThread({ contactId, fallbackContact, onBack, onOpened, onSent }: Props) {
  const { contact: loadedContact, messages, loading, error, sending, send, safetyMessage } =
    useConversation(contactId);
  const contact = loadedContact ?? fallbackContact;
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) onOpened(contactId);
  }, [loading, contactId, onOpened]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, contactId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const sent = await send(text);
    // Keep the draft if sending failed so nothing the patient typed is lost.
    if (sent) {
      setDraft("");
      onSent(contactId, sent);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-[#E6E3E3] px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="rounded-md p-1 hover:bg-gray-100 md:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        {contact && <Avatar name={contact.name} image={contact.image} size={36} />}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{contact?.name ?? "Conversation"}</p>
          {contact && <p className="truncate text-xs text-[#757575]">{contact.subtitle}</p>}
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        {loading && <p className="text-center text-sm text-[#757575]">Loading messages…</p>}

        {!loading && !messages.length && !error && (
          <p className="mx-auto max-w-sm pt-10 text-center text-sm text-[#757575]">
            Send {contact?.name ?? "your doctor"} a message about your care. For an emergency,
            call emergency services instead.
          </p>
        )}

        {messages.map((message) => {
          const mine = message.sender === "patient";
          return (
            <div key={message.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && contact && <Avatar name={contact.name} image={contact.image} size={28} />}
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 sm:max-w-[70%] ${
                  mine ? "bg-[#28574E] text-white" : "border border-[#DCF2EE] bg-[#F0FAF7] text-[#141313]"
                }`}
              >
                <p className="whitespace-pre-line break-words text-sm">{message.body}</p>
                <p className={`pt-1 text-[11px] ${mine ? "text-white/70" : "text-[#757575]"}`}>
                  {formatMessageStamp(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#E6E3E3] p-4">
        {safetyMessage && (
          <p role="alert" className="mb-3 flex gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            <TriangleAlert size={18} className="shrink-0" />
            {safetyMessage}
          </p>
        )}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <div className="relative">
          <input
            type="text"
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSend();
            }}
            placeholder="Type your Message..."
            aria-label="Message"
            className="h-11 w-full rounded-md border border-[#C2C6D4] pl-4 pr-12 text-sm focus:border-[#28574E] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#28574E] disabled:opacity-40"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
