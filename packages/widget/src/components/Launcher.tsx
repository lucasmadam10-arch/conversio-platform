import { isOpen } from "../store/widget.store";

export function Launcher() {
  return (
    <button
      onClick={() => { isOpen.value = !isOpen.value; }}
      aria-label={isOpen.value ? "Close chat" : "Open chat"}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontSize: "24px",
        boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s",
      }}
    >
      {isOpen.value ? "×" : "💬"}
    </button>
  );
}
