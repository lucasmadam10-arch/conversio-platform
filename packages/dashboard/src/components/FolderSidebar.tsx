import type { CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInboxStore } from "../stores/inbox.store";
import { useAuthStore } from "../stores/auth.store";

type Folder = "UNASSIGNED" | "ASSIGNED" | "LYRO" | "RESOLVED" | "SPAM";

const INBOX_FOLDERS: { id: Folder; label: string; icon: string }[] = [
  { id: "UNASSIGNED", label: "Unassigned", icon: "📥" },
  { id: "ASSIGNED",   label: "Mine",       icon: "👤" },
  { id: "LYRO",       label: "AI (Lyro)",  icon: "🤖" },
  { id: "RESOLVED",   label: "Resolved",   icon: "✅" },
  { id: "SPAM",       label: "Spam",       icon: "🚫" },
];

function SidebarItem({ icon, label, active, onClick }: {
  icon: string; label: string; active: boolean; onClick: () => void;
}) {
  const base: CSSProperties = {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 20px", cursor: "pointer", fontSize: "14px",
    textAlign: "left", width: "100%", fontFamily: "inherit",
    border: "none", borderLeft: "3px solid transparent",
    background: "transparent", color: "#c4c0e8",
    transition: "background 0.15s, color 0.15s",
  };
  const activeStyle: CSSProperties = {
    background: "rgba(99,102,241,0.25)",
    color: "#fff",
    borderLeft: "3px solid #6366f1",
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...(active ? activeStyle : {}) }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function FolderSidebar() {
  const { activeFolder, setFolder } = useInboxStore();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const isTickets = location.pathname.startsWith("/tickets");

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <div style={{
      width: "220px", background: "#1e1b4b",
      display: "flex", flexDirection: "column",
      padding: "16px 0", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "0 20px 20px", fontWeight: 700, fontSize: "20px",
        color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        Convers<span style={{ color: "#a5b4fc" }}>io</span>
      </div>

      {/* Inbox */}
      <div style={{ padding: "16px 20px 6px", fontSize: "11px", fontWeight: 600, color: "#6d6a9c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Inbox
      </div>
      {INBOX_FOLDERS.map(f => (
        <SidebarItem
          key={f.id} icon={f.icon} label={f.label}
          active={!isTickets && activeFolder === f.id}
          onClick={() => { setFolder(f.id); void navigate("/inbox"); }}
        />
      ))}

      {/* Manage */}
      <div style={{ padding: "16px 20px 6px", fontSize: "11px", fontWeight: 600, color: "#6d6a9c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Manage
      </div>
      <SidebarItem icon="🎫" label="Tickets"   active={isTickets} onClick={() => void navigate("/tickets")} />
      <SidebarItem icon="👥" label="Contacts"  active={false}     onClick={() => void navigate("/inbox")} />
      <SidebarItem icon="📊" label="Analytics" active={false}     onClick={() => void navigate("/inbox")} />
      <SidebarItem icon="⚙️" label="Settings"  active={false}     onClick={() => void navigate("/inbox")} />

      {/* User */}
      <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px" }}>
        <button
          onClick={() => { logout(); void navigate("/login"); }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px", borderRadius: "8px", cursor: "pointer",
            background: "transparent", border: "none", width: "100%", fontFamily: "inherit",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#6366f1", display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "13px", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.displayName ?? "Agent"}
            </div>
            <div style={{ fontSize: "11px", color: "#6d6a9c" }}>Sign out</div>
          </div>
        </button>
      </div>
    </div>
  );
}
