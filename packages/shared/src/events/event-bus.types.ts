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

export type DomainEvent = {
  id: string;
  tenantId: string;
  type: EventType;
  payload: Record<string, unknown>;
  ts: string; // ISO 8601
  source?: string;
};

// Typed payloads per event type
export type ConversationCreatedPayload = {
  conversationId: string;
  tenantId: string;
  contactId: string;
  channel: string;
};

export type MessageReceivedPayload = {
  messageId: string;
  conversationId: string;
  tenantId: string;
  senderType: string;
  senderId?: string;
};

export type ConversationOwnerChangedPayload = {
  conversationId: string;
  tenantId: string;
  previousOwnerType: string;
  newOwnerType: string;
  newOwnerId?: string;
};

export type ConversationResolvedPayload = {
  conversationId: string;
  tenantId: string;
  resolvedBy: string;
};
