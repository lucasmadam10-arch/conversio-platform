import type { DomainEvent } from "@conversio/shared";
import { domainEventsQueue } from "./queue";

/**
 * Publish a domain event to the BullMQ queue.
 * IMPORTANT: Call AFTER transactions commit, never inside a transaction.
 */
export async function publishEvent(event: DomainEvent): Promise<void> {
  await domainEventsQueue.add(event.type, event, {
    jobId: event.id,
  });
}
