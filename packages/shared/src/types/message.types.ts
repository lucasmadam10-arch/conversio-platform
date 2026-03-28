export type SenderType = "VISITOR" | "AGENT" | "BOT" | "LYRO" | "SYSTEM";

export type MessagePayloadType =
  | "text"
  | "image"
  | "file"
  | "form"
  | "form_response"
  | "system"
  | "card"
  | "quick_replies";

export type MessageAttachment = {
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
};

export type MessagePayload = {
  type: MessagePayloadType;
  content?: string;
  attachments?: MessageAttachment[];
  formFields?: Record<string, unknown>[];
  quickReplies?: string[];
  metadata?: Record<string, unknown>;
};
