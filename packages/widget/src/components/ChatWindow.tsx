import { isOpen, tenantName, conversationId, connectionState } from "../store/widget.store";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import type { WsClient } from "../api/ws-client";
import { WsEventType } from "../constants";

type Props = {
  wsClient: WsClient | null;
  tenantSlug?: string;
  apiBaseUrl?: string;
};

export function ChatWindow({ wsClient }: Props) {
  if (!isOpen.value) return null;

  function handleSend(text: string) {
    const convId = conversationId.value;
    if (!convId || !wsClient) return;

    wsClient.send(WsEventType.SEND_MESSAGE, {
      conversationId: convId,
      payload: { type: "text", content: text },
    });
  }

  function handleTypingStart() {
    const convId = conversationId.value;
    if (!convId || !wsClient) return;
    wsClient.send(WsEventType.TYPING_START, { conversationId: convId });
  }

  function handleTypingStop() {
    const convId = conversationId.value;
    if (!convId || !wsClient) return;
    wsClient.send(WsEventType.TYPING_STOP, { conversationId: convId });
  }

  const isOffline = connectionState.value === "offline";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        width: "360px",
        height: "500px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
        fontFamily: "'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#6366f1",
          color: "#fff",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>{tenantName.value}</div>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>
            {isOffline ? "Reconnecting..." : "Online"}
          </div>
        </div>
        <button
          onClick={() => { isOpen.value = false; }}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ×
        </button>
      </div>

      <MessageList />

      <InputBar
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}
