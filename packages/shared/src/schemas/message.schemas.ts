import { z } from "zod";

export const MessagePayloadSchema = z.object({
  type: z.enum([
    "text",
    "image",
    "file",
    "form",
    "form_response",
    "system",
    "card",
    "quick_replies",
  ]),
  content: z.string().optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string(),
        size: z.number().optional(),
        mimeType: z.string().optional(),
      }),
    )
    .optional(),
  formFields: z.array(z.record(z.unknown())).optional(),
  quickReplies: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type MessagePayloadInput = z.infer<typeof MessagePayloadSchema>;

export const CreateMessageSchema = z.object({
  conversationId: z.string().uuid(),
  payload: MessagePayloadSchema,
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;

export const ListMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type ListMessagesInput = z.infer<typeof ListMessagesSchema>;
