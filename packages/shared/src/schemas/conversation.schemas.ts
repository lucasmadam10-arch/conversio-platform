import { z } from "zod";

export const CreateConversationSchema = z.object({
  contactId: z.string().uuid(),
  channel: z.enum(["WEB_CHAT", "MESSENGER", "INSTAGRAM", "WHATSAPP", "EMAIL", "API"]),
  subject: z.string().max(255).optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;

export const UpdateConversationSchema = z.object({
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]).optional(),
  folder: z
    .enum(["UNASSIGNED", "ASSIGNED", "LYRO", "RESOLVED", "SPAM"])
    .optional(),
  subject: z.string().max(255).optional(),
});

export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;

export const AssignConversationSchema = z
  .object({
    ownerType: z.enum(["UNASSIGNED", "AGENT", "FLOW", "LYRO", "SYSTEM"]),
    ownerId: z.string().uuid().optional(),
  })
  .refine(
    (data) => data.ownerType !== "AGENT" || data.ownerId !== undefined,
    { message: "ownerId is required when ownerType is AGENT" },
  );

export type AssignConversationInput = z.infer<typeof AssignConversationSchema>;

export const ListConversationsSchema = z.object({
  folder: z
    .enum(["UNASSIGNED", "ASSIGNED", "LYRO", "RESOLVED", "SPAM"])
    .optional(),
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]).optional(),
  channel: z
    .enum(["WEB_CHAT", "MESSENGER", "INSTAGRAM", "WHATSAPP", "EMAIL", "API"])
    .optional(),
  assignedTo: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  /** Free-text search on conversation subject */
  query: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type ListConversationsInput = z.infer<typeof ListConversationsSchema>;
