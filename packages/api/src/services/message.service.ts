import type { Message } from "@conversio/db";
import type { CursorPage, MessagePayloadInput } from "@conversio/shared";
import { EventType } from "@conversio/shared";
import { messageRepository } from "../repositories/message.repository";
import { conversationRepository } from "../repositories/conversation.repository";
import { orchestratorService } from "./orchestrator.service";
import { publishEvent } from "../jobs/event-publisher";

export class MessageService {
  async create(data: {
    conversationId: string;
    tenantId: string;
    senderType: Message["senderType"];
    senderId?: string;
    payload: MessagePayloadInput;
  }): Promise<Message> {
    // Verify conversation belongs to tenant
    await conversationRepository.findById(data.tenantId, data.conversationId);

    const message = await messageRepository.create({
      conversationId: data.conversationId,
      senderType: data.senderType,
      senderId: data.senderId,
      payload: data.payload,
    });

    // Update conversation's updatedAt
    await conversationRepository.update(data.tenantId, data.conversationId, {});

    // Publish message received event
    await publishEvent({
      id: crypto.randomUUID(),
      tenantId: data.tenantId,
      type: EventType.MESSAGE_RECEIVED,
      payload: {
        messageId: message.id,
        conversationId: data.conversationId,
        tenantId: data.tenantId,
        senderType: data.senderType,
        senderId: data.senderId,
      },
      ts: new Date().toISOString(),
      source: "message-service",
    });

    // If visitor message, run orchestration
    if (data.senderType === "VISITOR") {
      const decision = await orchestratorService.decide(
        data.tenantId,
        data.conversationId,
      );
      await orchestratorService.transition(
        data.tenantId,
        data.conversationId,
        decision,
      );
    }

    return message;
  }

  async list(
    tenantId: string,
    conversationId: string,
    opts: { cursor?: string; limit?: number },
  ): Promise<CursorPage<Message>> {
    // Verify access
    await conversationRepository.findById(tenantId, conversationId);
    return messageRepository.findByConversation(conversationId, opts);
  }

  async findAfter(
    tenantId: string,
    conversationId: string,
    afterId: string,
  ): Promise<Message[]> {
    await conversationRepository.findById(tenantId, conversationId);
    return messageRepository.findAfter(conversationId, afterId);
  }
}

export const messageService = new MessageService();
