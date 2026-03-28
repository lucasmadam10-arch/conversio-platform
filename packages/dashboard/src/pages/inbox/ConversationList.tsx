import { useState } from "react";
import type { ChangeEvent } from "react";
import { trpc } from "../../api/trpc-client";
import { useInboxStore } from "../../stores/inbox.store";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

const CHANNEL_COLOR: Record<string, string> = {
  WEB_CHAT: "#e0e7ff",
  EMAIL: "#fef3c7",
  MESSENGER: "#dbeafe",
};
const CHANNEL_TEXT: Record<string, string> = {
  WEB_CHAT: "#3730a3",
  EMAIL: "#92400e",
  MESSENGER: "#1e40af",
};

export function ConversationList() {
  const { activeFolder, activeConversationId, setActiveConversation } = useInboxStore();
  const [search, setSearch] = useState("");

  const query = trpc.conversation.list.useQuery({
    folder: activeFolder,
    query: search || undefined,
    limit: 40,
  });

  const conversations = query.data?.items ?? [];

  return (
    <div style={{
      width: "300px", borderRight: "1px solid #e5e7eb",
      display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "16px", borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          Conversations
        </h2>
        <span style={{
          fontSize: "12px", color: "#6b7280", background: "#f3f4f6",
          padding: "2px 8px", borderRadius: "99px",
        }}>
          {conversations.length}
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <input
          type="text"
          placeholder="🔍  Search conversations..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "7px 12px", border: "1px solid #d1d5db",
            borderRadius: "8px", fontSize: "13px", outline: "none",
            fontFamily: "inherit", color: "#374151", boxSizing: "border-box",
          }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#6366f1"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {query.isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            {search ? "No results found" : "No conversations"}
          </div>
        ) : (
          conversations.map(conv => {
            const active = activeConversationId === conv.id;
            const channel = conv.channel ?? "WEB_CHAT";
            const subject = conv.subject ?? `Chat ${conv.id.slice(0, 8)}`;
            const time = formatTime(conv.updatedAt.toString());

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                style={{
                  display: "flex", flexDirection: "column", gap: "5px",
                  padding: "12px 16px", background: active ? "#eef2ff" : "#fff",
                  border: "none", borderBottom: "1px solid #f3f4f6",
                  borderLeft: active ? "3px solid #6366f1" : "3px solid transparent",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  fontFamily: "inherit", transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#111827", flex: 1, marginRight: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {subject}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>{time}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.status?.replace(/_/g, " ") ?? "Open"}
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600,
                    background: CHANNEL_COLOR[channel] ?? "#f3f4f6",
                    color: CHANNEL_TEXT[channel] ?? "#374151",
                  }}>
                    {channel.replace("_", " ")}
                  </span>
                  {conv.status === "OPEN" && (
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600, background: "#d1fae5", color: "#065f46" }}>
                      Open
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
