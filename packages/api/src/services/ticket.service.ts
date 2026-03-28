import { ticketRepository } from "../repositories/ticket.repository";
import { conversationRepository } from "../repositories/conversation.repository";
import { publishEvent } from "../jobs/event-publisher";
import { EventType } from "@conversio/shared";
import type { CreateTicketInput, UpdateTicketInput, ListTicketsInput } from "@conversio/shared";

export class TicketService {
  async create(tenantId: string, input: CreateTicketInput, createdByUserId: string) {
    // If linked to a conversation, verify it belongs to this tenant
    if (input.conversationId) {
      await conversationRepository.findById(tenantId, input.conversationId);
    }

    const ticket = await ticketRepository.create(tenantId, input);

    await publishEvent({
      id: crypto.randomUUID(),
      tenantId,
      type: EventType.TICKET_CREATED,
      payload: { ticketId: ticket.id, createdByUserId, conversationId: input.conversationId },
      ts: new Date().toISOString(),
      source: "ticket-service",
    });

    return ticket;
  }

  async update(tenantId: string, id: string, input: UpdateTicketInput, updatedByUserId: string) {
    const ticket = await ticketRepository.update(tenantId, id, input);

    await publishEvent({
      id: crypto.randomUUID(),
      tenantId,
      type: EventType.TICKET_UPDATED,
      payload: { ticketId: ticket.id, updatedByUserId, changes: input },
      ts: new Date().toISOString(),
      source: "ticket-service",
    });

    return ticket;
  }

  async get(tenantId: string, id: string) {
    return ticketRepository.findById(tenantId, id);
  }

  async list(tenantId: string, input: ListTicketsInput) {
    return ticketRepository.findMany(tenantId, input);
  }
}

export const ticketService = new TicketService();
