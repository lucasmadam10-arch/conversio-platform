import { useNavigate, useLocation } from "react-router-dom";
import { useInboxStore } from "../stores/inbox.store";

const FOLDERS = [
  { id: "UNASSIGNED", label: "Unassigned", icon: "📥" },
  { id: "ASSIGNED", label: "Assigned", icon: "👤" },
  { id: "LYRO", label: "AI (Lyro)", icon: "🤖" },
  { id: "RESOLVED", label: "Resolved", icon: "✅" },
  { id: "SPAM", label: "Spam", icon: "🚫" },
] as const;

export function FolderSidebar() {
  const { activeFolder, setFolder } = useInboxStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isTickets = location.pathname.startsWith("/tickets");

  return (
    <div
      style={{
        width: "200px",
        background: "#1f2937",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "16px 0",
      }}
    >
      <div style={{ padding: "0 16px 16px", fontWeight: 700, fontSize: "16px" }}>
        Conversio
      </div>

      <div style={{ padding: "4px 8px", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
        Inbox
      </div>

      {FOLDERS.map((folder) => (
        <button
          key={folder.id}
          onClick={() => { setFolder(folder.id); void navigate("/inbox"); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: !isTickets && activeFolder === folder.id ? "#374151" : "transparent",
            color: !isTickets && activeFolder === folder.id ? "#fff" : "#d1d5db",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            textAlign: "left",
            borderRadius: "0",
            width: "100%",
          }}
        >
          <span>{folder.icon}</span>
          <span>{folder.label}</span>
        </button>
      ))}

      <div style={{ padding: "12px 8px 4px", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
        Support
      </div>

      <button
        onClick={() => void navigate("/tickets")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          background: isTickets ? "#374151" : "transparent",
          color: isTickets ? "#fff" : "#d1d5db",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          textAlign: "left",
          borderRadius: "0",
          width: "100%",
        }}
      >
        <span>🎫</span>
        <span>Tickets</span>
      </button>
    </div>
  );
}
