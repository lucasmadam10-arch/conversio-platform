import type { MessageItem } from "../store/widget.store";

type Props = {
  message: MessageItem;
};

export function MessageBubble({ message }: Props) {
  const isVisitor = message.senderType === "VISITOR";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isVisitor ? "flex-end" : "flex-start",
        marginBottom: "8px",
        padding: "0 12px",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: isVisitor ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isVisitor ? "#6366f1" : "#f3f4f6",
          color: isVisitor ? "#fff" : "#111827",
          fontSize: "14px",
          lineHeight: "1.5",
          wordBreak: "break-word",
        }}
      >
        {message.payload.content ?? ""}
      </div>
    </div>
  );
}
