import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import type { IConversationSummary } from "../../../types/conversation";
import { formatMessageStamp } from "../../../utils/formatDate";

type Props = {
  conversations: IConversationSummary[];
  selectedId: string | null;
  onSelect: (contactId: string) => void;
};

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter(({ contact, lastMessage }) =>
      `${contact.name} ${contact.subtitle} ${lastMessage?.body ?? ""}`.toLowerCase().includes(term)
    );
  }, [conversations, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            color="#605E5E"
            size={16}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversation"
            className="h-9 w-full rounded-md border border-[#E7E4E4] pl-9 pr-3 text-sm focus:border-[#28574E] focus:outline-none"
          />
        </label>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {visible.map(({ contact, lastMessage, unreadCount: count }) => {
          const selected = contact.id === selectedId;
          // The open conversation is being read, so it never shows a badge.
          const unreadCount = selected ? 0 : count;
          return (
            <li key={contact.id}>
              <button
                type="button"
                onClick={() => onSelect(contact.id)}
                aria-current={selected ? "true" : undefined}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  selected ? "bg-[#EAF6F2]" : "hover:bg-gray-50"
                }`}
              >
                <Avatar name={contact.name} image={contact.image} size={36} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{contact.name}</span>
                    {lastMessage && (
                      <span className="shrink-0 text-[11px] text-[#757575]">
                        {formatMessageStamp(lastMessage.createdAt)}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-xs ${unreadCount ? "font-medium text-[#141313]" : "text-[#757575]"}`}>
                      {lastMessage
                        ? `${lastMessage.sender === "patient" ? "You: " : ""}${lastMessage.body}`
                        : contact.subtitle}
                    </span>
                    {unreadCount > 0 && (
                      <span
                        aria-label={`${unreadCount} unread`}
                        className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#28574E] px-1.5 text-[11px] text-white"
                      >
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        {!visible.length && (
          <li className="px-4 py-6 text-center text-sm text-[#757575]">No conversations match.</li>
        )}
      </ul>
    </div>
  );
}
