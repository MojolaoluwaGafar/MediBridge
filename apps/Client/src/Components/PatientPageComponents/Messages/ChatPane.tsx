import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import ChatInput from "../../PortalComponents/ChatInput";
import SafetyNotice from "../../PortalComponents/SafetyNotice";
import { useConversation } from "../../../Hooks/Messages/useConversations";
import { formatMessageTime } from "../../../utils/formatDate";

type Props = {
  contactId: string;
  onBack?: () => void;
  onChange: () => void;
};

export default function ChatPane({ contactId, onBack, onChange }: Props) {
  const { contact, messages, loading, error, sending, safetyNotice, send } = useConversation(contactId, onChange);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  // Scroll to the newest message when one arrives, not on every poll.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-[#E6E3E3] px-4 py-3">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Back to conversations" className="rounded-md p-1 hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
        )}
        {contact && (
          <>
            <Avatar name={contact.name} image={contact.image} size="sm" />
            <div className="min-w-0">
              <p className="truncate fontOutfit text-sm font-medium">{contact.name}</p>
              <p className="truncate text-xs text-[#757575]">{contact.subtitle}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
        {loading && <p className="text-center text-sm text-[#757575]">Loading conversation…</p>}

        {!loading && messages.length === 0 && contact && (
          <p className="mx-auto max-w-sm pt-10 text-center text-sm text-[#757575]">
            No messages yet. Ask {contact.name} a question about your care, and they'll reply here.
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.sender === "patient";
          const time = formatMessageTime(message.createdAt);

          return isMine ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-tr-none bg-[#28574E] px-3 py-2 text-white sm:max-w-[70%]">
                <p className="whitespace-pre-line wrap-break-word text-sm">{message.body}</p>
                <p className="pt-1 text-[11px] text-white/70">{time}</p>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex items-start gap-2">
              {contact && <Avatar name={contact.name} image={contact.image} size="sm" />}
              <div className="max-w-[85%] rounded-lg rounded-tl-none border border-[#D7EFE9] bg-[#EEF9F6] px-3 py-2 sm:max-w-[70%]">
                <p className="whitespace-pre-line wrap-break-word text-sm text-[#141313]">{message.body}</p>
                <p className="pt-1 text-[11px] text-[#757575]">{time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-3 border-t border-[#E6E3E3] p-3 sm:p-4">
        {safetyNotice && <SafetyNotice level={safetyNotice.level} message={safetyNotice.message} />}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <ChatInput
          placeholder="Type your message…"
          disabled={sending || loading || !contact}
          onSend={send}
        />
      </div>
    </div>
  );
}
