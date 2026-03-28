import { useState } from "react";
import { trpc } from "../../api/trpc-client";

type TicketState = "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATE_OPTIONS: TicketState[] = ["OPEN", "IN_PROGRESS", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"];

type Props = {
  ticketId: string;
  onClose: () => void;
};

export function TicketDetail({ ticketId, onClose }: Props) {
  const utils = trpc.useUtils();
  const query = trpc.ticket.get.useQuery({ id: ticketId });

  const updateMutation = trpc.ticket.update.useMutation({
    onSuccess: () => {
      void utils.ticket.get.invalidate({ id: ticketId });
      void utils.ticket.list.invalidate();
    },
  });

  const resolveMutation = trpc.ticket.resolve.useMutation({
    onSuccess: () => {
      void utils.ticket.get.invalidate({ id: ticketId });
      void utils.ticket.list.invalidate();
    },
  });

  const closeMutation = trpc.ticket.close.useMutation({
    onSuccess: () => {
      void utils.ticket.get.invalidate({ id: ticketId });
      void utils.ticket.list.invalidate();
      onClose();
    },
  });

  const [editingSubject, setEditingSubject] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState("");

  if (query.isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
        Loading...
      </div>
    );
  }

  const ticket = query.data;
  if (!ticket) return null;

  const isResolved = ticket.state === "RESOLVED" || ticket.state === "CLOSED";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {editingSubject ? (
          <input
            value={subjectDraft}
            onChange={(e) => setSubjectDraft(e.target.value)}
            onBlur={() => {
              if (subjectDraft.trim() && subjectDraft !== ticket.subject) {
                updateMutation.mutate({ id: ticket.id, data: { subject: subjectDraft.trim() } });
              }
              setEditingSubject(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditingSubject(false);
            }}
            autoFocus
            style={{
              flex: 1,
              fontSize: "16px",
              fontWeight: 700,
              border: "1px solid #6366f1",
              borderRadius: "4px",
              padding: "4px 8px",
              outline: "none",
              marginRight: "12px",
            }}
          />
        ) : (
          <h3
            onClick={() => { setSubjectDraft(ticket.subject); setEditingSubject(true); }}
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              cursor: "text",
              flex: 1,
              marginRight: "12px",
            }}
          >
            {ticket.subject}
          </h3>
        )}

        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {!isResolved && (
            <button
              onClick={() => resolveMutation.mutate({ id: ticket.id })}
              disabled={resolveMutation.isPending}
              style={{
                padding: "6px 12px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: resolveMutation.isPending ? 0.7 : 1,
              }}
            >
              Resolve
            </button>
          )}
          <button
            onClick={() => closeMutation.mutate({ id: ticket.id })}
            disabled={closeMutation.isPending}
            style={{
              padding: "6px 12px",
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Properties */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <Field label="Status">
          <select
            value={ticket.state}
            onChange={(e) =>
              updateMutation.mutate({ id: ticket.id, data: { state: e.target.value as TicketState } })
            }
            style={selectStyle}
          >
            {STATE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </Field>

        <Field label="Priority">
          <select
            value={ticket.priority}
            onChange={(e) =>
              updateMutation.mutate({ id: ticket.id, data: { priority: e.target.value as TicketPriority } })
            }
            style={selectStyle}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Source">
          <span style={{ fontSize: "14px", color: "#374151" }}>{ticket.source}</span>
        </Field>

        <Field label="Created">
          <span style={{ fontSize: "14px", color: "#374151" }}>
            {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </Field>

        {ticket.conversationId && (
          <Field label="Linked conversation">
            <span style={{ fontSize: "14px", color: "#6366f1", fontFamily: "monospace" }}>
              {ticket.conversationId.slice(0, 8)}…
            </span>
          </Field>
        )}

        {ticket.resolvedAt && (
          <Field label="Resolved">
            <span style={{ fontSize: "14px", color: "#374151" }}>
              {new Date(ticket.resolvedAt).toLocaleString()}
            </span>
          </Field>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ width: "140px", fontSize: "13px", color: "#6b7280", fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "4px 8px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};
