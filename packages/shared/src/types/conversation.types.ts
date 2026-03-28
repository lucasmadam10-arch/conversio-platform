export type Channel =
  | "WEB_CHAT"
  | "MESSENGER"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "EMAIL"
  | "API";

export type OwnerType = "UNASSIGNED" | "AGENT" | "FLOW" | "LYRO" | "SYSTEM";

export type ConversationFolder =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "LYRO"
  | "RESOLVED"
  | "SPAM";

export type ConversationStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

export type OrchestrationDecision =
  | "FLOW_HANDLES"
  | "LYRO_HANDLES"
  | "AGENT_HANDLES"
  | "NO_HANDLER";
