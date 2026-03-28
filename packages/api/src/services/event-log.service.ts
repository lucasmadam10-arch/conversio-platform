import { prisma, Prisma } from "@conversio/db";
import type { DomainEvent } from "@conversio/shared";

/**
 * Persists domain events to the event_log table for audit trail and analytics queries.
 * Called from the BullMQ domain-events worker (not directly from request handlers).
 */
export class EventLogService {
  async record(event: DomainEvent): Promise<void> {
    await prisma.eventLog.create({
      data: {
        id: event.id,
        tenantId: event.tenantId,
        eventType: event.type,
        payload: event.payload as Prisma.InputJsonValue,
        ts: new Date(event.ts),
      },
    });
  }

  async query(
    tenantId: string,
    opts: {
      eventType?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    },
  ) {
    return prisma.eventLog.findMany({
      where: {
        tenantId,
        ...(opts.eventType ? { eventType: opts.eventType } : {}),
        ...(opts.from || opts.to
          ? {
              ts: {
                ...(opts.from ? { gte: opts.from } : {}),
                ...(opts.to ? { lte: opts.to } : {}),
              },
            }
          : {}),
      },
      orderBy: { ts: "desc" },
      take: opts.limit ?? 100,
    });
  }

  async countByType(
    tenantId: string,
    eventType: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    return prisma.eventLog.count({
      where: {
        tenantId,
        eventType,
        ts: { gte: from, lte: to },
      },
    });
  }
}

export const eventLogService = new EventLogService();
