import { useEffect, useRef } from "react";
import { trpc } from "../../api/trpc-client";
import { useInboxStore } from "../../stores/inbox.store";
import { ReplyComposer } from "./ReplyComposer";
import { useRealtime } from "../../hooks/useRealtime";

function MessageBubble({ message }: { message: { id: string; senderType: string; payload: unknown; createdAt: unknown } }) {
  const isAgent = message.senderType === "AGENT";
  const payload = message.payload as { content?: string; type?: string };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAgent ? "flex-end" : "flex-start",
        marginBottom: "8px",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "10px 14px",
          borderRadius: "12px",
          background: isAgent ? "#6366f1" : "#f3f4f6",
          color: isAgent ? "#fff" : "#111827",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        {payload.content ?? ""}
        <div
          style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "4px",
            textAlign: isAgent ? "right" : "left",
          }}
        >
          {message.senderType}
        </div>
      </div>
    </div>
  );
}

export function ConversationThread() {
  const { activeConversationId } = useInboxStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { joinConversation } = useRealtime();

  const query = trpc.message.list.useQuery(
    { conversationId: activeConversationId!, limit: 50 },
    { enabled: !!activeConversationId },
  );

  const convQuery = trpc.conversation.get.useQuery(
    { id: activeConversationId! },
    { enabled: !!activeConversationId },
  );

  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
    }
  }, [activeConversationId, joinConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [query.data?.items.length]);

  if (!activeConversationId) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        Select a conversation to view messages
      </div>
    );
  }

  const messages = query.data?.items ?? [];
  const subject = convQuery.data?.subject ?? `Conversation ${activeConversationId.slice(0, 8)}`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Thread header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 600,
          fontSize: "15px",
          background: "#fff",
        }}
      >
        {subject}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 0", background: "#fafafa" }}>
        {query.isLoading ? (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", padding: "40px" }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", padding: "40px" }}>
            No messages yet
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ReplyComposer conversationId={activeConversationId} />
    </div>
  );
}
