import { z } from "zod";

// ============================================
// Domain Events — the backbone of the platform
// ============================================

export const EventType = {
  // Visitor lifecycle
  VISITOR_SESSION_STARTED: "visitor_session_started",
  PAGE_VIEWED: "page_viewed",
  WIDGET_OPENED: "widget_opened",

  // Messaging
  MESSAGE_RECEIVED: "message_received",
  MESSAGE_SENT: "message_sent",

  // Flow engine
  FLOW_TRIGGERED: "flow_triggered",
  FLOW_COMPLETED: "flow_completed",
  FLOW_ERRORED: "flow_errored",

  // AI / Lyro
  LYRO_STARTED: "lyro_started",
  LYRO_RESPONDED: "lyro_responded",
  LYRO_HANDOFF_REQUESTED: "lyro_handoff_requested",
  LYRO_ACTION_EXECUTED: "lyro_action_executed",

  // Conversations
  CONVERSATION_CREATED: "conversation_created",
  CONVERSATION_ASSIGNED: "conversation_assigned",
  CONVERSATION_RESOLVED: "conversation_resolved",
  CONVERSATION_OWNER_CHANGED: "conversation_owner_changed",

  // Tickets
  TICKET_CREATED: "ticket_created",
  TICKET_UPDATED: "ticket_updated",
  TICKET_RESOLVED: "ticket_resolved",

  // Contacts
  CONTACT_CREATED: "contact_created",
  CONTACT_UPDATED: "contact_updated",
  CONTACT_MERGED: "contact_merged",

  // Integrations
  INTEGRATION_SYNC_COMPLETED: "integration_sync_completed",
  INTEGRATION_ERROR: "integration_error",

  // Feedback
  CSAT_SUBMITTED: "csat_submitted",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

// Base event envelope
export const DomainEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: z.string(),
  payload: z.record(z.unknown()),
  ts: z.string().datetime(),
  source: z.string().optional(), // which service emitted this
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;

// ============================================
// Channel & Owner types (shared across services)
// ============================================

export const Channel = {
  WEB_CHAT: "WEB_CHAT",
  MESSENGER: "MESSENGER",
  INSTAGRAM: "INSTAGRAM",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  API: "API",
} as const;

export type Channel = (typeof Channel)[keyof typeof Channel];

export const OwnerType = {
  UNASSIGNED: "UNASSIGNED",
  AGENT: "AGENT",
  FLOW: "FLOW",
  LYRO: "LYRO",
  SYSTEM: "SYSTEM",
} as const;

export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];

export const SenderType = {
  VISITOR: "VISITOR",
  AGENT: "AGENT",
  BOT: "BOT",
  LYRO: "LYRO",
  SYSTEM: "SYSTEM",
} as const;

export type SenderType = (typeof SenderType)[keyof typeof SenderType];

// ============================================
// Message payload schema
// ============================================

export const MessagePayloadSchema = z.object({
  type: z.enum(["text", "image", "file", "form", "form_response", "system", "card", "quick_replies"]),
  content: z.string().optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string(),
        size: z.number().optional(),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
  formFields: z.array(z.record(z.unknown())).optional(),
  quickReplies: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

// ============================================
// Orchestrator decision types
// ============================================

export const OrchestrationDecision = {
  FLOW_HANDLES: "FLOW_HANDLES",
  LYRO_HANDLES: "LYRO_HANDLES",
  AGENT_HANDLES: "AGENT_HANDLES",
  NO_HANDLER: "NO_HANDLER",
} as const;

export type OrchestrationDecision =
  (typeof OrchestrationDecision)[keyof typeof OrchestrationDecision];

// ============================================
// WebSocket event types (realtime)
// ============================================

export const WsEventType = {
  // Client → Server
  AUTHENTICATE: "authenticate",
  SEND_MESSAGE: "send_message",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  READ_RECEIPT: "read_receipt",
  JOIN_CONVERSATION: "join_conversation",

  // Server → Client
  NEW_MESSAGE: "new_message",
  CONVERSATION_UPDATE: "conversation_update",
  TYPING_INDICATOR: "typing_indicator",
  PRESENCE_UPDATE: "presence_update",
  ASSIGNMENT_CHANGE: "assignment_change",
  ERROR: "error",
} as const;

export type WsEventType = (typeof WsEventType)[keyof typeof WsEventType];
