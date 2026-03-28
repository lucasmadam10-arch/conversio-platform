import { trpc } from "../../api/trpc-client";
import { useInboxStore } from "../../stores/inbox.store";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export function ConversationList() {
  const { activeFolder, activeConversationId, setActiveConversation } = useInboxStore();

  const query = trpc.conversation.list.useQuery({
    folder: activeFolder,
    limit: 30,
  });

  if (query.isLoading) {
    return (
      <div style={{ padding: "20px", color: "#6b7280", fontSize: "14px" }}>
        Loading...
      </div>
    );
  }

  const conversations = query.data?.items ?? [];

  return (
    <div
      style={{
        width: "300px",
        borderRight: "1px solid #e5e7eb",
        overflowY: "auto",
        background: "#fff",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 600,
          fontSize: "14px",
          color: "#374151",
        }}
      >
        {activeFolder.charAt(0) + activeFolder.slice(1).toLowerCase()} ({conversations.length})
      </div>

      {conversations.length === 0 ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
          No conversations
        </div>
      ) : (
        conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "12px 16px",
              background: activeConversationId === conv.id ? "#f0f0ff" : "#fff",
              border: "none",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "13px", color: "#111827" }}>
                {conv.subject ?? `Conversation ${conv.id.slice(0, 8)}`}
              </span>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                {formatTime(conv.updatedAt.toString())}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {conv.channel} · {conv.status}
            </div>
          </button>
        ))
      )}
    </div>
  );
}
