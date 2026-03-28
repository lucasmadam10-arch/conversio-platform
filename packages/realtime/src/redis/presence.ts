import { Redis } from "ioredis";
import { config } from "../config";

const redis = new Redis(config.REDIS_URL);

const presenceKey = (tenantId: string) => `presence:tenant:${tenantId}`;
const PRESENCE_TTL_MS = 60_000; // 60 seconds

export async function setPresence(tenantId: string, userId: string): Promise<void> {
  await redis.zadd(presenceKey(tenantId), Date.now(), userId);
}

export async function removePresence(tenantId: string, userId: string): Promise<void> {
  await redis.zrem(presenceKey(tenantId), userId);
}

export async function getActiveAgents(tenantId: string): Promise<string[]> {
  const since = Date.now() - PRESENCE_TTL_MS;
  return redis.zrangebyscore(presenceKey(tenantId), since, "+inf");
}

export async function setTyping(
  conversationId: string,
  userId: string,
): Promise<void> {
  await redis.setex(`typing:${conversationId}:${userId}`, 5, "1");
}

export async function clearTyping(
  conversationId: string,
  userId: string,
): Promise<void> {
  await redis.del(`typing:${conversationId}:${userId}`);
}

export async function setReadReceipt(
  conversationId: string,
  userId: string,
  messageId: string,
): Promise<void> {
  await redis.set(`read:${conversationId}:${userId}`, messageId);
}
