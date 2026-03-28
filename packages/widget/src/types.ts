export type MessagePayload = {
  type: string;
  content?: string;
  attachments?: { url: string; name: string }[];
  metadata?: Record<string, unknown>;
};
