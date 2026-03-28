import type { Conversation } from "@conversio/db";
import { prisma } from "@conversio/db";
import { NotFoundError } from "@conversio/shared";
import { assertTenantMatch, buildCursor, parseCursor } from "@conversio/shared";
import type { CursorPage, ListConversationsInput } from "@conversio/shared";

export class ConversationRepository {
  async findById(tenantId: string, conversationId: string): Promise<Conversation> {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundError("Conversation");
    assertTenantMatch(conv.tenantId, tenantId);
    return conv;
  }

  async findMany(
    tenantId: string,
    input: ListConversationsInput,
  ): Promise<CursorPage<Conversation>> {
    const { folder, status, channel, assignedTo, contactId, query, cursor, limit } = input;

    let cursorWhere: { createdAt?: { lt: Date }; id?: { lt: string } } = {};
    if (cursor) {
      const parsed = parseCursor(cursor);
      cursorWhere = {
        createdAt: { lt: parsed.createdAt },
      };
    }

    const items = await prisma.conversation.findMany({
      where: {
        tenantId,
        ...(folder ? { folder } : {}),
        ...(status ? { status } : {}),
        ...(channel ? { channel } : {}),
        ...(assignedTo ? { currentOwnerId: assignedTo } : {}),
        ...(contactId ? { contactId } : {}),
        ...(query ? { subject: { contains: query, mode: "insensitive" } } : {}),
        ...cursorWhere,
      },
      orderBy: { updatedAt: "desc" },
      take: limit + 1,
    });

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const lastItem = resultItems[resultItems.length - 1];

    return {
      items: resultItems,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? buildCursor(lastItem.id, lastItem.updatedAt)
          : undefined,
    };
  }

  async create(data: {
    tenantId: string;
    contactId: string;
    channel: Conversation["channel"];
    subject?: string;
  }): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        channel: data.channel,
        subject: data.subject,
        currentOwnerType: "UNASSIGNED",
        folder: "UNASSIGNED",
        status: "OPEN",
      },
    });
  }

  async findOrCreateForContact(
    tenantId: string,
    contactId: string,
    channel: Conversation["channel"],
  ): Promise<Conversation> {
    const existing = await prisma.conversation.findFirst({
      where: {
        tenantId,
        contactId,
        channel,
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) return existing;

    return this.create({ tenantId, contactId, channel });
  }

  async updateOwner(
    tenantId: string,
    conversationId: string,
    ownerType: Conversation["currentOwnerType"],
    ownerId?: string,
  ): Promise<Conversation> {
    const existing = await this.findById(tenantId, conversationId);

    // Determine folder based on owner type
    let folder: Conversation["folder"] = existing.folder;
    if (ownerType === "UNASSIGNED") folder = "UNASSIGNED";
    else if (ownerType === "AGENT") folder = "ASSIGNED";
    else if (ownerType === "LYRO") folder = "LYRO";

    return prisma.conversation.update({
      where: { id: existing.id },
      data: {
        currentOwnerType: ownerType,
        currentOwnerId: ownerId ?? null,
        folder,
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(
    tenantId: string,
    conversationId: string,
    status: Conversation["status"],
  ): Promise<Conversation> {
    const existing = await this.findById(tenantId, conversationId);

    return prisma.conversation.update({
      where: { id: existing.id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : existing.resolvedAt,
        folder:
          status === "RESOLVED" || status === "CLOSED"
            ? "RESOLVED"
            : existing.folder,
        updatedAt: new Date(),
      },
    });
  }

  async update(
    tenantId: string,
    conversationId: string,
    data: {
      subject?: string;
      status?: Conversation["status"];
      folder?: Conversation["folder"];
    },
  ): Promise<Conversation> {
    const existing = await this.findById(tenantId, conversationId);
    return prisma.conversation.update({
      where: { id: existing.id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async getWithMessages(
    tenantId: string,
    conversationId: string,
    messageLimit = 20,
  ) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: messageLimit,
        },
        contact: true,
      },
    });
    if (!conv) throw new NotFoundError("Conversation");
    assertTenantMatch(conv.tenantId, tenantId);
    return { ...conv, messages: conv.messages.reverse() };
  }
}

export const conversationRepository = new ConversationRepository();
