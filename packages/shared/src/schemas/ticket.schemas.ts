import { z } from "zod";
import { PaginationSchema } from "./pagination.schemas";

export const CreateTicketSchema = z.object({
  conversationId: z.string().uuid().optional(),
  subject: z.string().min(1).max(255),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  ownerId: z.string().uuid().optional(),
  source: z.enum(["CHAT", "EMAIL", "MANUAL", "AI_HANDOFF"]).default("MANUAL"),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateTicketSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  state: z.enum(["OPEN", "IN_PROGRESS", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"]).optional(),
  slaDeadline: z.string().datetime().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ListTicketsSchema = PaginationSchema.extend({
  state: z.enum(["OPEN", "IN_PROGRESS", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  ownerId: z.string().uuid().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type ListTicketsInput = z.infer<typeof ListTicketsSchema>;
