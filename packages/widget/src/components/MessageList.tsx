import { useEffect, useRef } from "preact/hooks";
import { messages, typingUsers } from "../store/widget.store";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function MessageList() {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.value.length]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.value.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "14px",
            marginTop: "40px",
          }}
        >
          Start a conversation...
        </div>
      ) : (
        messages.value.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))
      )}
      {typingUsers.value.length > 0 && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
