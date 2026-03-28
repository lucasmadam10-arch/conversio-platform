import { useState, useRef } from "preact/hooks";
import { connectionState } from "../store/widget.store";

type Props = {
  onSend: (text: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
};

export function InputBar({ onSend, onTypingStart, onTypingStop }: Props) {
  const [text, setText] = useState("");
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const isOffline = connectionState.value === "offline";

  function handleInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    setText(val);

    if (!isTypingRef.current && val.length > 0) {
      isTypingRef.current = true;
      onTypingStart?.();
    }

    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop?.();
      }
    }, 1000);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isOffline) return;

    if (typingRef.current) clearTimeout(typingRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }

    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px",
        borderTop: "1px solid #e5e7eb",
        gap: "8px",
        background: "#fff",
      }}
    >
      <input
        type="text"
        value={text}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={isOffline ? "Reconnecting..." : "Type a message..."}
        disabled={isOffline}
        style={{
          flex: 1,
          border: "1px solid #d1d5db",
          borderRadius: "20px",
          padding: "8px 14px",
          fontSize: "14px",
          outline: "none",
          opacity: isOffline ? 0.6 : 1,
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isOffline}
        style={{
          background: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          cursor: "pointer",
          fontSize: "16px",
          opacity: !text.trim() || isOffline ? 0.5 : 1,
        }}
      >
        ↑
      </button>
    </div>
  );
}
