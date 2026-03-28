import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { config } from "../config";

const connection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const domainEventsQueue = new Queue("domain-events", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export const orchestrationQueue = new Queue("orchestration", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 500 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  },
});

export const notificationsQueue = new Queue("notifications", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 500 },
  },
});

export { connection as redisConnection };
