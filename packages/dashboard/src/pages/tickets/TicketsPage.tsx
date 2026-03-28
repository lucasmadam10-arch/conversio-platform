import { useState } from "react";
import { trpc } from "../../api/trpc-client";
import { AppShell } from "../../components/AppShell";
import { TicketDetail } from "./TicketDetail";
import { CreateTicketModal } from "./CreateTicketModal";

type TicketState = "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type TicketItem = {
  id: string;
  subject: string;
  priority: string;
  state: string;
  source: string;
  createdAt: Date;
};

const STATE_LABELS: Record<TicketState, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING_ON_CUSTOMER: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: "#6b7280",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  URGENT: "#7c3aed",
};

export function TicketsPage() {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<TicketState | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);

  const query = trpc.ticket.list.useQuery({
    state: stateFilter,
    limit: 30,
  });

  const tickets = query.data?.items ?? [];

  return (
    <AppShell>
    <div style={{ display: "flex", flex: 1, overflow: "hidden", background: "#f9fafb" }}>
      {/* Left panel */}
      <div
        style={{
          width: "380px",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Tickets</h2>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "6px 12px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + New
          </button>
        </div>

        {/* State filter tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "8px 16px",
            borderBottom: "1px solid #e5e7eb",
            overflowX: "auto",
          }}
        >
          {([undefined, "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => setStateFilter(s)}
              style={{
                padding: "4px 10px",
                border: "1px solid",
                borderColor: stateFilter === s ? "#6366f1" : "#d1d5db",
                borderRadius: "99px",
                fontSize: "12px",
                background: stateFilter === s ? "#eef2ff" : "#fff",
                color: stateFilter === s ? "#6366f1" : "#374151",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {s ? STATE_LABELS[s] : "All"}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {query.isLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
              Loading...
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
              No tickets found
            </div>
          ) : (
            (tickets as TicketItem[]).map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: "12px 16px",
                  background: activeTicketId === ticket.id ? "#f0f0ff" : "#fff",
                  border: "none",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#111827", flex: 1, marginRight: "8px" }}>
                    {ticket.subject}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: PRIORITY_COLORS[ticket.priority as TicketPriority] ?? "#6b7280",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "#f3f4f6",
                      color: "#374151",
                    }}
                  >
                    {STATE_LABELS[ticket.state as TicketState] ?? ticket.state}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {ticket.source}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTicketId ? (
          <TicketDetail
            ticketId={activeTicketId}
            onClose={() => setActiveTicketId(null)}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            Select a ticket to view details
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            setActiveTicketId(id);
            void query.refetch();
          }}
        />
      )}
    </div>
    </AppShell>
  );
}
