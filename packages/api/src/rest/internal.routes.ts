import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { MessagePayloadSchema } from "@conversio/shared";
import { messageService } from "../services/message.service";
import { config } from "../config";

const InternalMessageSchema = z.object({
  conversationId: z.string().uuid(),
  tenantId: z.string().uuid(),
  senderType: z.enum(["VISITOR", "AGENT", "BOT", "LYRO", "SYSTEM"]),
  senderId: z.string().optional(),
  payload: MessagePayloadSchema,
});

export async function internalRoutes(app: FastifyInstance) {
  // Auth hook for internal routes
  app.addHook("preHandler", async (req, reply) => {
    const key = req.headers["x-internal-key"];
    if (key !== config.INTERNAL_API_KEY) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });

  // POST /internal/messages — called by realtime service
  app.post("/internal/messages", async (req, reply) => {
    const body = InternalMessageSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Invalid body", details: body.error.flatten() });
    }

    try {
      const message = await messageService.create(body.data);
      return reply.send(message);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: "Internal error" });
    }
  });

  // GET /internal/messages?conversationId=&after= — for WS reconnect catchup
  app.get<{
    Querystring: { conversationId: string; tenantId: string; after: string };
  }>("/internal/messages", async (req, reply) => {
    const { conversationId, tenantId, after } = req.query;
    if (!conversationId || !tenantId || !after) {
      return reply.status(400).send({ error: "Missing query params" });
    }

    try {
      const messages = await messageService.findAfter(tenantId, conversationId, after);
      return reply.send(messages);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: "Internal error" });
    }
  });
}
