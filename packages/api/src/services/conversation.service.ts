import type { Conversation } from "@conversio/db";
import type { CursorPage, CreateConversationInput, ListConversationsInput, AssignConversationInput } from "@conversio/shared";
import { EventType } from "@conversio/shared";
import { conversationRepository } from "../repositories/conversation.repository";
import { publishEvent } from "../jobs/event-publisher";

export class ConversationService {
  async create(
    tenantId: string,
    input: CreateConversationInput,
  ): Promise<Conversation> {
    const conv = await conversationRepository.create({
      tenantId,
      contactId: input.contactId,
      channel: input.channel,
      subject: input.subject,
    });

    await publishEvent({
      id: crypto.randomUUID(),
      tenantId,
      type: EventType.CONVERSATION_CREATED,
      payload: {
        conversationId: conv.id,
        tenantId,
        contactId: input.contactId,
        channel: input.channel,
      },
      ts: new Date().toISOString(),
      source: "conversation-service",
    });

    return conv;
  }

  async list(
    tenantId: string,
    input: ListConversationsInput,
  ): Promise<CursorPage<Conversation>> {
    return conversationRepository.findMany(tenantId, input);
  }

  async get(tenantId: string, conversationId: string, messageLimit = 20) {
    return conversationRepository.getWithMessages(
      tenantId,
      conversationId,
      messageLimit,
    );
  }

  async assign(
    tenantId: string,
    conversationId: string,
    input: AssignConversationInput,
    assignedBy: string,
  ): Promise<Conversation> {
    const conv = await conversationRepository.updateOwner(
      tenantId,
      conversationId,
      input.ownerType,
      input.ownerId,
    );

    await publishEvent({
      id: crypto.randomUUID(),
      tenantId,
      type: EventType.CONVERSATION_ASSIGNED,
      payload: {
        conversationId,
        tenantId,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        assignedBy,
      },
      ts: new Date().toISOString(),
      source: "conversation-service",
    });

    return conv;
  }

  async resolve(
    tenantId: string,
    conversationId: string,
    resolvedBy: string,
  ): Promise<Conversation> {
    const conv = await conversationRepository.updateStatus(
      tenantId,
      conversationId,
      "RESOLVED",
    );

    await publishEvent({
      id: crypto.randomUUID(),
      tenantId,
      type: EventType.CONVERSATION_RESOLVED,
      payload: { conversationId, tenantId, resolvedBy },
      ts: new Date().toISOString(),
      source: "conversation-service",
    });

    return conv;
  }
}

export const conversationService = new ConversationService();
