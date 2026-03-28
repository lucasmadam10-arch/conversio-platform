import { useState } from "react";
import type { FormEvent } from "react";
import { trpc } from "../../api/trpc-client";

type Props = {
  onClose: () => void;
  onCreated: (id: string) => void;
};

export function CreateTicketModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    subject: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    source: "MANUAL" as "CHAT" | "EMAIL" | "MANUAL" | "AI_HANDOFF",
    conversationId: "",
  });

  const mutation = trpc.ticket.create.useMutation({
    onSuccess: (ticket) => onCreated(ticket.id),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      subject: form.subject,
      priority: form.priority,
      source: form.source,
      conversationId: form.conversationId.trim() || undefined,
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "440px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>Create ticket</h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              required
              placeholder="Briefly describe the issue"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as typeof form.priority }))}
                style={inputStyle}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as typeof form.source }))}
                style={inputStyle}
              >
                <option value="MANUAL">Manual</option>
                <option value="CHAT">Chat</option>
                <option value="EMAIL">Email</option>
                <option value="AI_HANDOFF">AI handoff</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Linked conversation ID (optional)</label>
            <input
              type="text"
              value={form.conversationId}
              onChange={(e) => setForm((f) => ({ ...f, conversationId: e.target.value }))}
              placeholder="UUID of an existing conversation"
              style={inputStyle}
            />
          </div>

          {mutation.error && (
            <div style={{ color: "#ef4444", fontSize: "13px" }}>{mutation.error.message}</div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} style={submitBtnStyle}>
              {mutation.isPending ? "Creating…" : "Create ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  background: "#fff",
  fontSize: "14px",
  cursor: "pointer",
};

const submitBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};
