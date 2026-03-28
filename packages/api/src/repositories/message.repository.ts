import type { Message } from "@conversio/db";
import { prisma } from "@conversio/db";
import type { CursorPage } from "@conversio/shared";
import { buildCursor, parseCursor } from "@conversio/shared";
import type { MessagePayloadInput } from "@conversio/shared";

export class MessageRepository {
  async create(data: {
    conversationId: string;
    senderType: Message["senderType"];
    senderId?: string;
    payload: MessagePayloadInput;
    metadata?: Record<string, unknown>;
  }): Promise<Message> {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderType: data.senderType,
        senderId: data.senderId,
        payload: data.payload as object,
        metadata: data.metadata ?? {},
      },
    });
  }

  async findByConversation(
    conversationId: string,
    opts: { cursor?: string; limit?: number } = {},
  ): Promise<CursorPage<Message>> {
    const { cursor, limit = 20 } = opts;

    let cursorWhere = {};
    if (cursor) {
      const parsed = parseCursor(cursor);
      cursorWhere = { createdAt: { lt: parsed.createdAt } };
    }

    const items = await prisma.message.findMany({
      where: { conversationId, ...cursorWhere },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const lastItem = resultItems[resultItems.length - 1];

    return {
      items: resultItems.reverse(), // return chronological order
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? buildCursor(lastItem.id, lastItem.createdAt)
          : undefined,
    };
  }

  async findAfter(conversationId: string, afterId: string): Promise<Message[]> {
    const pivot = await prisma.message.findUnique({ where: { id: afterId } });
    if (!pivot) return [];

    return prisma.message.findMany({
      where: {
        conversationId,
        createdAt: { gt: pivot.createdAt },
      },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const messageRepository = new MessageRepository();
