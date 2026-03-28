export { EventType } from "./event-bus.types";
export type {
  EventType as EventTypeValue,
  DomainEvent,
  ConversationCreatedPayload,
  MessageReceivedPayload,
  ConversationOwnerChangedPayload,
  ConversationResolvedPayload,
} from "./event-bus.types";

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
