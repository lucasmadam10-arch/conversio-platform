import type { WebSocket } from "ws";
import { z } from "zod";
import { WsEventType, MessagePayloadSchema } from "@conversio/shared";
import { joinRoom, broadcast } from "./rooms";
import {
  subscribeToConversation,
  publishToConversation,
} from "../redis/pubsub";
import {
  setTyping,
  clearTyping,
  setReadReceipt,
} from "../redis/presence";
import { config } from "../config";
import type { WsAuthContext } from "./auth";

const SendMessageSchema = z.object({
  type: z.literal(WsEventType.SEND_MESSAGE),
  conversationId: z.string().uuid(),
  payload: MessagePayloadSchema,
});

const TypingSchema = z.object({
  type: z.enum([WsEventType.TYPING_START, WsEventType.TYPING_STOP]),
  conversationId: z.string().uuid(),
});

const ReadReceiptSchema = z.object({
  type: z.literal(WsEventType.READ_RECEIPT),
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
});

const JoinConversationSchema = z.object({
  type: z.literal(WsEventType.JOIN_CONVERSATION),
  conversationId: z.string().uuid(),
  lastEventId: z.string().uuid().optional(),
});

export async function handleMessage(
  socket: WebSocket,
  auth: WsAuthContext,
  data: unknown,
): Promise<void> {
  if (typeof data !== "object" || data === null || !("type" in data)) {
    socket.send(JSON.stringify({ type: WsEventType.ERROR, message: "Invalid message format" }));
    return;
  }

  const msgType = (data as { type: string }).type;

  try {
    switch (msgType) {
      case WsEventType.SEND_MESSAGE: {
        const parsed = SendMessageSchema.safeParse(data);
        if (!parsed.success) {
          socket.send(JSON.stringify({ type: WsEventType.ERROR, message: "Invalid message payload" }));
          return;
        }

        const { conversationId, payload } = parsed.data;

        // Forward to API for persistence via internal endpoint
        const apiResponse = await fetch(
          `${config.API_URL}/internal/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-key": config.INTERNAL_API_KEY,
            },
            body: JSON.stringify({
              conversationId,
              tenantId: auth.tenantId,
              senderType: auth.role === "VISITOR" ? "VISITOR" : "AGENT",
              senderId: auth.userId,
              payload,
            }),
          },
        );

        if (!apiResponse.ok) {
          socket.send(JSON.stringify({ type: WsEventType.ERROR, message: "Failed to send message" }));
          return;
        }

        const message = await apiResponse.json();

        // Broadcast to all room members via Redis pub/sub
        await publishToConversation(conversationId, {
          type: WsEventType.NEW_MESSAGE,
          conversationId,
          message,
        });

        break;
      }

      case WsEventType.TYPING_START:
      case WsEventType.TYPING_STOP: {
        const parsed = TypingSchema.safeParse(data);
        if (!parsed.success) return;

        const { conversationId, type } = parsed.data;
        const isTyping = type === WsEventType.TYPING_START;

        if (isTyping) {
          await setTyping(conversationId, auth.userId);
        } else {
          await clearTyping(conversationId, auth.userId);
        }

        broadcast(
          conversationId,
          {
            type: WsEventType.TYPING_INDICATOR,
            conversationId,
            userId: auth.userId,
            isTyping,
          },
          socket, // exclude sender
        );

        break;
      }

      case WsEventType.READ_RECEIPT: {
        const parsed = ReadReceiptSchema.safeParse(data);
        if (!parsed.success) return;

        const { conversationId, messageId } = parsed.data;
        await setReadReceipt(conversationId, auth.userId, messageId);

        broadcast(conversationId, {
          type: WsEventType.READ_RECEIPT,
          conversationId,
          userId: auth.userId,
          messageId,
        });

        break;
      }

      case WsEventType.JOIN_CONVERSATION: {
        const parsed = JoinConversationSchema.safeParse(data);
        if (!parsed.success) {
          socket.send(JSON.stringify({ type: WsEventType.ERROR, message: "Invalid join payload" }));
          return;
        }

        const { conversationId, lastEventId } = parsed.data;

        joinRoom(conversationId, socket);
        await subscribeToConversation(conversationId);

        // Catch up on missed messages after reconnect
        if (lastEventId) {
          const missedResponse = await fetch(
            `${config.API_URL}/internal/messages?conversationId=${conversationId}&tenantId=${auth.tenantId}&after=${lastEventId}`,
            { headers: { "x-internal-key": config.INTERNAL_API_KEY } },
          );

          if (missedResponse.ok) {
            const missed = await missedResponse.json();
            for (const msg of missed as unknown[]) {
              socket.send(
                JSON.stringify({ type: WsEventType.NEW_MESSAGE, conversationId, message: msg }),
              );
            }
          }
        }

        socket.send(
          JSON.stringify({ type: "joined", conversationId }),
        );

        break;
      }

      default:
        socket.send(JSON.stringify({ type: WsEventType.ERROR, message: `Unknown message type: ${msgType}` }));
    }
  } catch (err) {
    console.error("WS handler error:", err);
    socket.send(JSON.stringify({ type: WsEventType.ERROR, message: "Internal error" }));
  }
}
