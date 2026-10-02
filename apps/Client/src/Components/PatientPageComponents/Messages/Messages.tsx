import { MessageCircleMore } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import ConversationList from "./ConversationList";
import ChatPane from "./ChatPane";
import { useConversations } from "../../../Hooks/Messages/useConversations";
import { useMediaQuery } from "../../../Hooks/Portal/useMediaQuery";

type Props = {
  // The person whose conversation is open (from the URL: ?doctor= for
  // patients, ?patient= for doctors).
  contactId: string | null;
  onSelectContact: (contactId: string | null) => void;
  side?: "patient" | "doctor";
};

const COPY = {
  patient: {
    description: "Conversations with your doctors and care team",
    emptyDescription: "Once you've booked an appointment, you can message your doctor here.",
  },
  doctor: {
    description: "Conversations with your patients",
    emptyDescription: "When a patient books with you, you can message them here.",
  },
};

// Fills the screen under the top bar and page header so the message list
// scrolls inside the card rather than the whole page.
const CARD_HEIGHT = "h-[calc(100dvh-16.5rem)] min-h-[24rem]";

export default function Messages({ contactId, onSelectContact, side = "patient" }: Props) {
  const copy = COPY[side];
  const { conversations, loading, error, refresh } = useConversations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Desktop shows the list and a conversation side by side, so open the most
  // recent one when none is chosen. Phones show one panel at a time.
  const openId = contactId ?? (isDesktop ? conversations[0]?.contact.id ?? null : null);

  const renderBody = () => {
    if (loading) {
      return <p className="py-10 text-center text-[#707070]">Loading your conversations…</p>;
    }

    if (error) {
      return (
        <EmptyState
          className="rounded-xl border border-[#E6E3E3] bg-white"
          icon={<MessageCircleMore size={28} />}
          title="We couldn't load your messages"
          description={error}
        />
      );
    }

    if (conversations.length === 0 && !contactId) {
      return (
        <EmptyState
          className="rounded-xl border border-[#E6E3E3] bg-white"
          icon={<MessageCircleMore size={28} />}
          title="No conversations yet"
          description={copy.emptyDescription}
        />
      );
    }

    return (
      <div className={`flex overflow-hidden rounded-xl border border-[#E6E3E3] bg-white ${CARD_HEIGHT}`}>
        <div className={`${openId ? "hidden lg:block" : "block"} w-full border-r border-[#E6E3E3] lg:w-80 lg:shrink-0`}>
          <ConversationList
            conversations={conversations}
            selectedId={openId}
            onSelect={onSelectContact}
            side={side}
          />
        </div>

        {openId ? (
          <div className="min-w-0 flex-1">
            <ChatPane
              key={openId}
              contactId={openId}
              onBack={isDesktop ? undefined : () => onSelectContact(null)}
              onChange={refresh}
              side={side}
            />
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-sm text-[#757575] lg:flex">
            Choose a conversation to read it.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Messages"
        description={copy.description}
      />
      <div className="mt-6">{renderBody()}</div>
    </div>
  );
}
