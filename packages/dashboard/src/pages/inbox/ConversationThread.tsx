import { useEffect, useRef } from "react";
import { trpc } from "../../api/trpc-client";
import { useInboxStore } from "../../stores/inbox.store";
import { ReplyComposer } from "./ReplyComposer";
import { useRealtime } from "../../hooks/useRealtime";

function formatTime(date: unknown): string {
  const d = new Date(date as string);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message }: {
  message: { id: string; senderType: string; payload: unknown; createdAt: unknown };
}) {
  const isAgent = message.senderType === "AGENT";
  const isSystem = message.senderType === "SYSTEM" || message.senderType === "BOT";
  const payload = message.payload as { content?: string };

  if (isSystem) {
    return (
      <div style={{ textAlign: "center", padding: "4px 16px" }}>
        <span style={{ fontSize: "12px", color: "#9ca3af", background: "#f3f4f6", padding: "2px 12px", borderRadius: "99px" }}>
          {payload.content ?? "System message"}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: isAgent ? "flex-end" : "flex-start",
      padding: "0 20px",
    }}>
      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isAgent ? "flex-end" : "flex-start", gap: "3px" }}>
        <div style={{
          padding: "10px 14px",
          borderRadius: isAgent ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isAgent ? "#6366f1" : "#f3f4f6",
          color: isAgent ? "#fff" : "#111827",
          fontSize: "14px",
          lineHeight: "1.5",
          wordBreak: "break-word",
        }}>
          {payload.content ?? ""}
        </div>
        <div style={{ fontSize: "11px", color: "#9ca3af", padding: "0 4px" }}>
          {formatTime(message.createdAt)} · {isAgent ? "You" : "Visitor"}
        </div>
      </div>
    </div>
  );
}

export function ConversationThread() {
  const { activeConversationId, setActiveConversation } = useInboxStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { joinConversation } = useRealtime();

  const msgQuery = trpc.message.list.useQuery(
    { conversationId: activeConversationId!, limit: 50 },
    { enabled: !!activeConversationId },
  );
  const convQuery = trpc.conversation.get.useQuery(
    { id: activeConversationId! },
    { enabled: !!activeConversationId },
  );
  const resolveMutation = trpc.conversation.update.useMutation({
    onSuccess: () => setActiveConversation(null),
  });

  useEffect(() => {
    if (activeConversationId) joinConversation(activeConversationId);
  }, [activeConversationId, joinConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgQuery.data?.items.length]);

  if (!activeConversationId) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "12px",
        color: "#9ca3af", background: "#fafafa",
      }}>
        <span style={{ fontSize: "48px" }}>💬</span>
        <span style={{ fontSize: "15px" }}>Select a conversation to view messages</span>
      </div>
    );
  }

  const messages = msgQuery.data?.items ?? [];
  const conv = convQuery.data;
  const subject = conv?.subject ?? `Chat ${activeConversationId.slice(0, 8)}`;
  const channel = conv?.channel ?? "WEB_CHAT";
  const status = conv?.status ?? "OPEN";
  const initials = subject.slice(0, 2).toUpperCase();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px", borderBottom: "1px solid #e5e7eb",
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "#ddd6fe", display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, color: "#5b21b6", fontSize: "14px",
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{subject}</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {channel.replace("_", " ")} · {status.replace(/_/g, " ")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              padding: "7px 14px", background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Assign to me
          </button>
          <button
            onClick={() => resolveMutation.mutate({ id: activeConversationId, state: "RESOLVED" as never })}
            style={{
              padding: "7px 14px", background: "#10b981", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ✓ Resolve
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 0", background: "#fafafa", display: "flex", flexDirection: "column", gap: "10px" }}>
        {msgQuery.isLoading ? (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", padding: "40px" }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", padding: "40px" }}>No messages yet</div>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <ReplyComposer conversationId={activeConversationId} />
    </div>
  );
}
