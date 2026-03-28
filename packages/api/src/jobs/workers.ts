import { Worker } from "bullmq";
import { redisConnection } from "./queue";
import { eventLogService } from "../services/event-log.service";
import type { DomainEvent } from "@conversio/shared";
import pino from "pino";

const logger = pino({ name: "workers" });

/**
 * Domain events worker — persists every published DomainEvent to event_log.
 * Start this alongside the API server in production.
 */
export const domainEventsWorker = new Worker(
  "domain-events",
  async (job) => {
    const event = job.data as DomainEvent;
    await eventLogService.record(event);
    logger.debug({ eventId: event.id, type: event.type }, "domain event recorded");
  },
  {
    connection: redisConnection,
    concurrency: 10,
  },
);

domainEventsWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "domain-events worker job failed");
});
