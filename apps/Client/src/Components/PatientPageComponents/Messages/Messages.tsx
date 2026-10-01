import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { MessageCircleMore } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import ConversationList from "./ConversationList";
import ConversationThread from "./ConversationThread";
import { useConversations } from "../../../Hooks/Messages/useConversations";
import { useMediaQuery } from "../../../Hooks/useMediaQuery";

// The open conversation lives in the URL (?tab=messages&contact=<doctorId>) so
// other pages can link straight to a doctor, and refresh/back keep it open.
const CONTACT_PARAM = "contact";

export default function Messages() {
  const { conversations, loading, error, markRead, showLatestMessage } = useConversations();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get(CONTACT_PARAM);
  // Phones show the list or the thread; wider screens show both side by side.
  const twoPanes = useMediaQuery("(min-width: 768px)");

  // On phones each step is a history entry, so the back button returns to
  // the list. Side by side, switching conversations just replaces the URL.
  const select = (contactId: string | null) =>
    setSearchParams(
      (params) => {
        if (contactId) params.set(CONTACT_PARAM, contactId);
        else params.delete(CONTACT_PARAM);
        return params;
      },
      { replace: twoPanes && Boolean(contactId) }
    );

  // On wide screens, open the most recent conversation, as in the design.
  useEffect(() => {
    if (twoPanes && !selectedId && conversations.length) {
      setSearchParams(
        (params) => {
          params.set(CONTACT_PARAM, conversations[0].contact.id);
          return params;
        },
        { replace: true }
      );
    }
  }, [twoPanes, selectedId, conversations, setSearchParams]);

  const selected = conversations.find((c) => c.contact.id === selectedId) ?? null;
  const showThread = Boolean(selectedId);

  const renderBody = () => {
    if (loading && !conversations.length) {
      return <p className="py-16 text-center text-[#707070]">Loading conversations…</p>;
    }
    if (error && !conversations.length) {
      return <p className="py-16 text-center text-red-600">{error}</p>;
    }
    if (!conversations.length && !selectedId) {
      return (
        <EmptyState
          icon={<MessageCircleMore size={24} />}
          title="No conversations yet"
          description="Once you book an appointment, you can message that doctor here."
        />
      );
    }

    return (
      <div className="flex h-[calc(100dvh-14rem)] min-h-[480px] overflow-hidden">
        <aside
          className={`w-full border-[#E6E3E3] md:block md:w-72 md:shrink-0 md:border-r ${
            showThread ? "hidden" : "block"
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={select}
          />
        </aside>

        <section className={`min-w-0 flex-1 ${showThread ? "block" : "hidden md:block"}`}>
          {selectedId ? (
            <ConversationThread
              key={selectedId}
              contactId={selectedId}
              fallbackContact={selected?.contact ?? null}
              onBack={() => select(null)}
              onOpened={markRead}
              onSent={showLatestMessage}
            />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-[#757575]">
              Choose a conversation to read it.
            </p>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="w-full">
      <PageHeader title="Messages" description="Conversations with your doctors and care team" />
      <div className="mt-6 rounded-xl border border-[#E6E3E3] bg-white">{renderBody()}</div>
    </div>
  );
}
