import { useState, useCallback, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { trpc } from "../../api/trpc-client";
import { dashboardWs } from "../../api/ws-client";

type Props = {
  conversationId: string;
};

export function ReplyComposer({ conversationId }: Props) {
  const [text, setText] = useState("");
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const createMessage = trpc.message.create.useMutation({
    onSuccess: () => setText(""),
  });

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
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
    },
    [conversationId],
  );

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (typingRef.current) clearTimeout(typingRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      dashboardWs.sendTyping(conversationId, false);
    }

    createMessage.mutate({
      conversationId,
      payload: { type: "text", content: trimmed },
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "12px 16px",
        background: "#fff",
      }}
    >
      <textarea
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type a reply... (Cmd+Enter to send)"
        rows={3}
        style={{
          width: "100%",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          padding: "10px 12px",
          fontSize: "14px",
          resize: "none",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "8px",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "12px", color: "#9ca3af", alignSelf: "center" }}>
          Cmd+Enter to send
        </span>
        <button
          onClick={handleSend}
          disabled={!text.trim() || createMessage.isPending}
          style={{
            padding: "8px 20px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: !text.trim() || createMessage.isPending ? 0.6 : 1,
          }}
        >
          {createMessage.isPending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
