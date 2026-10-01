import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import type { IConversationSummary } from "../../../types/conversation";
import { formatRelativeDay } from "../../../utils/formatDate";

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
    return conversations.filter(({ contact }) =>
      `${contact.name} ${contact.subtitle}`.toLowerCase().includes(term)
    );
  }, [conversations, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#E6E3E3] p-3">
        <label className="relative block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search color="#605E5E" size={16} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversation"
            aria-label="Search conversation"
            className="h-10 w-full rounded-lg border border-[#E7E4E4] pl-9 pr-3 text-sm focus:outline-none focus:border-[#28574E]"
          />
        </label>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {visible.map(({ contact, lastMessage, unreadCount }) => {
          const isSelected = contact.id === selectedId;
          const preview = lastMessage
            ? `${lastMessage.sender === "patient" ? "You: " : ""}${lastMessage.body}`
            : `Start a conversation with ${contact.name}`;

          return (
            <li key={contact.id}>
              <button
                type="button"
                onClick={() => onSelect(contact.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                  isSelected ? "bg-[#E0F8F3]" : "hover:bg-gray-50"
                }`}
              >
                <Avatar name={contact.name} image={contact.image} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate fontOutfit text-sm font-medium">{contact.name}</span>
                    {lastMessage && (
                      <span className="shrink-0 text-[11px] text-[#757575]">
                        {formatRelativeDay(lastMessage.createdAt)}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-xs ${unreadCount ? "font-medium text-[#141313]" : "text-[#757575]"}`}>
                      {preview}
                    </span>
                    {unreadCount > 0 && (
                      <span className="shrink-0 rounded-full bg-[#28574E] px-1.5 text-[11px] text-white">
                        <span className="sr-only">Unread messages: </span>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        {visible.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-[#757575]">No conversations match “{search}”.</li>
        )}
      </ul>
    </div>
  );
}
