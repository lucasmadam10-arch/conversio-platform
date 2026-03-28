export const WsEventType = {
  SEND_MESSAGE: "send_message",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  READ_RECEIPT: "read_receipt",
  JOIN_CONVERSATION: "join_conversation",
  NEW_MESSAGE: "new_message",
  CONVERSATION_UPDATE: "conversation_update",
  TYPING_INDICATOR: "typing_indicator",
  PRESENCE_UPDATE: "presence_update",
  ERROR: "error",
} as const;
