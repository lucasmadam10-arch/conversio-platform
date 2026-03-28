import { useState, useCallback, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { trpc } from "../../api/trpc-client";
import { dashboardWs } from "../../api/ws-client";

export function ReplyComposer({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState("");
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const createMessage = trpc.message.create.useMutation({
    onSuccess: () => setText(""),
  });

  const handleInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (!isTypingRef.current && e.target.value.length > 0) {
      isTypingRef.current = true;
      dashboardWs.sendTyping(conversationId, true);
    }
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        dashboardWs.sendTyping(conversationId, false);
      }
    }, 1000);
  }, [conversationId]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || createMessage.isPending) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    if (isTypingRef.current) { isTypingRef.current = false; dashboardWs.sendTyping(conversationId, false); }
    createMessage.mutate({ conversationId, payload: { type: "text", content: trimmed } });
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
      <textarea
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type a reply… (Enter to send, Shift+Enter for new line)"
        rows={3}
        style={{
          width: "100%", padding: "10px 14px",
          border: "1px solid #d1d5db", borderRadius: "10px",
          fontSize: "14px", fontFamily: "inherit", resize: "none",
          outline: "none", color: "#111827", lineHeight: "1.5",
          boxSizing: "border-box",
        }}
        onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = "#6366f1"; (e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
        onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = "#d1d5db"; (e.target as HTMLTextAreaElement).style.boxShadow = "none"; }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Enter לשליחה · Shift+Enter לשורה חדשה</span>
        <button
          onClick={handleSend}
          disabled={!text.trim() || createMessage.isPending}
          style={{
            padding: "8px 20px", background: "#6366f1", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            opacity: !text.trim() || createMessage.isPending ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {createMessage.isPending ? "Sending…" : "Send ↑"}
        </button>
      </div>
    </div>
  );
}
