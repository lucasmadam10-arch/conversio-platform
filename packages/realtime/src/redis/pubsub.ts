import { Redis } from "ioredis";
import { config } from "../config";
import { broadcast } from "../ws/rooms";

// Two separate Redis connections required:
// subscriber cannot multiplex with regular commands
const publisher = new Redis(config.REDIS_URL);
const subscriber = new Redis(config.REDIS_URL);

// Ref-count: how many local clients are subscribed to each conversation
const refCounts = new Map<string, number>();

subscriber.on("message", (channel: string, messageStr: string) => {
  // channel format: conv:<conversationId>
  if (!channel.startsWith("conv:")) return;
  const conversationId = channel.slice(5);

  let parsed: unknown;
  try {
    parsed = JSON.parse(messageStr);
  } catch {
    return;
  }

  broadcast(conversationId, parsed);
});

export async function subscribeToConversation(
  conversationId: string,
): Promise<void> {
  const current = refCounts.get(conversationId) ?? 0;
  refCounts.set(conversationId, current + 1);

  if (current === 0) {
    await subscriber.subscribe(`conv:${conversationId}`);
  }
}

export async function unsubscribeFromConversation(
  conversationId: string,
): Promise<void> {
  const current = refCounts.get(conversationId) ?? 0;
  if (current <= 0) return;

  const next = current - 1;
  refCounts.set(conversationId, next);

  if (next === 0) {
    refCounts.delete(conversationId);
    await subscriber.unsubscribe(`conv:${conversationId}`);
  }
}

export async function publishToConversation(
  conversationId: string,
  event: unknown,
): Promise<void> {
  await publisher.publish(`conv:${conversationId}`, JSON.stringify(event));
}
