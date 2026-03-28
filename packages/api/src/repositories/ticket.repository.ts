import { prisma } from "@conversio/db";
import type { PrismaTransactionClient } from "@conversio/db";
import { NotFoundError, ConflictError, assertTenantMatch } from "@conversio/shared";
import type { CreateTicketInput, UpdateTicketInput, ListTicketsInput } from "@conversio/shared";
import { buildCursor, parseCursor } from "@conversio/shared";

export class TicketRepository {
  async findById(tenantId: string, id: string, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundError("Ticket not found");
    assertTenantMatch(ticket.tenantId, tenantId);
    return ticket;
  }

  async findMany(tenantId: string, input: ListTicketsInput) {
    const limit = input.limit ?? 20;
    let cursorCondition = {};

    if (input.cursor) {
      const { createdAt } = parseCursor(input.cursor);
      cursorCondition = {
        createdAt: { lt: createdAt },
      };
    }

    const where = {
      tenantId,
      ...(input.state ? { state: input.state } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.ownerId ? { ownerId: input.ownerId } : {}),
      ...cursorCondition,
    };

    const items = await prisma.ticket.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0
        ? buildCursor(items[items.length - 1]!.id, items[items.length - 1]!.createdAt)
        : undefined;

    return { items, nextCursor, hasMore };
  }

  async create(tenantId: string, input: CreateTicketInput, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    try {
      return await db.ticket.create({
        data: {
          tenantId,
          conversationId: input.conversationId ?? null,
          subject: input.subject,
          priority: input.priority ?? "MEDIUM",
          ownerId: input.ownerId ?? null,
          source: input.source ?? "MANUAL",
          metadata: input.metadata ?? {},
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2002") {
        throw new ConflictError("Ticket already exists");
      }
      throw e;
    }
  }

  async update(tenantId: string, id: string, input: UpdateTicketInput) {
    await this.findById(tenantId, id);

    const data: Record<string, unknown> = {};
    if (input.subject !== undefined) data["subject"] = input.subject;
    if (input.priority !== undefined) data["priority"] = input.priority;
    if (input.ownerId !== undefined) data["ownerId"] = input.ownerId;
    if (input.state !== undefined) {
      data["state"] = input.state;
      if (input.state === "RESOLVED" || input.state === "CLOSED") {
        data["resolvedAt"] = new Date();
      }
    }
    if (input.slaDeadline !== undefined) {
      data["slaDeadline"] = input.slaDeadline ? new Date(input.slaDeadline) : null;
    }
    if (input.metadata !== undefined) data["metadata"] = input.metadata;

    return prisma.ticket.update({ where: { id }, data });
  }
}

export const ticketRepository = new TicketRepository();
