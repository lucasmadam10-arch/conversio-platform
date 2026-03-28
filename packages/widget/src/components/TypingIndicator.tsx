
export function TypingIndicator() {
  return (
    <div style={{ padding: "4px 24px", fontSize: "13px", color: "#6b7280" }}>
      <span>Agent is typing</span>
      <span style={{ marginLeft: "4px" }}>
        <span style={{ animation: "dot 1.4s infinite" }}>.</span>
        <span style={{ animation: "dot 1.4s infinite 0.2s" }}>.</span>
        <span style={{ animation: "dot 1.4s infinite 0.4s" }}>.</span>
      </span>
    </div>
  );
}
