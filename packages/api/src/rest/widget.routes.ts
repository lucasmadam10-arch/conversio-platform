import type { FastifyInstance } from "fastify";
import * as jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@conversio/db";
import { MessagePayloadSchema, NotFoundError } from "@conversio/shared";
import { contactRepository } from "../repositories/contact.repository";
import { conversationRepository } from "../repositories/conversation.repository";
import { messageService } from "../services/message.service";
import { config } from "../config";

const WIDGET_TOKEN_EXPIRY = "24h";

const SessionRequestSchema = z.object({
  visitorId: z.string().optional(),
  pageUrl: z.string().url().optional(),
  deviceInfo: z.string().optional(),
});

const WidgetMessageSchema = z.object({
  conversationId: z.string().uuid(),
  payload: MessagePayloadSchema,
});

export async function widgetRoutes(app: FastifyInstance) {
  // GET /widget/:slug/config — public, no auth
  app.get<{ Params: { slug: string } }>(
    "/widget/:slug/config",
    async (req, reply) => {
      try {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: req.params.slug },
          select: { id: true, name: true, settings: true, plan: true },
        });

        if (!tenant) {
          return reply.status(404).send({ error: "Tenant not found" });
        }

        return reply.send({
          tenantId: tenant.id,
          name: tenant.name,
          settings: tenant.settings,
          plan: tenant.plan,
        });
      } catch {
        return reply.status(500).send({ error: "Internal error" });
      }
    },
  );

  // POST /widget/:slug/session — creates/resumes visitor session
  app.post<{ Params: { slug: string } }>(
    "/widget/:slug/session",
    async (req, reply) => {
      try {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: req.params.slug },
        });

        if (!tenant) {
          return reply.status(404).send({ error: "Tenant not found" });
        }

        const body = SessionRequestSchema.safeParse(req.body);
        if (!body.success) {
          return reply.status(400).send({ error: "Invalid request body" });
        }

        const { visitorId, pageUrl, deviceInfo } = body.data;
        const resolvedVisitorId =
          visitorId ?? `anon_${crypto.randomUUID().replace(/-/g, "")}`;

        // Find or create contact by visitor ID
        const contact = await contactRepository.findOrCreate(
          tenant.id,
          resolvedVisitorId,
          "visitorId",
        );

        // Update contact's last seen
        await prisma.contact.update({
          where: { id: contact.id },
          data: { lastSeenAt: new Date() },
        });

        // Create session record
        const session = await prisma.session.create({
          data: {
            contactId: contact.id,
            channel: "WEB_CHAT",
            deviceInfo: deviceInfo ? { userAgent: deviceInfo } : {},
            metadata: pageUrl ? { pageUrl } : {},
          },
        });

        // Find or create open conversation
        const conversation = await conversationRepository.findOrCreateForContact(
          tenant.id,
          contact.id,
          "WEB_CHAT",
        );

        // Issue widget-scoped JWT (role=VISITOR)
        const widgetToken = jwt.sign(
          { sub: resolvedVisitorId, tid: tenant.id, role: "VISITOR", cid: conversation.id },
          config.JWT_SECRET,
          { expiresIn: WIDGET_TOKEN_EXPIRY } as jwt.SignOptions,
        );

        return reply.send({
          sessionId: session.id,
          conversationId: conversation.id,
          visitorId: resolvedVisitorId,
          widgetToken,
        });
      } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Internal error" });
      }
    },
  );

  // POST /widget/:slug/message — auth via widgetToken
  app.post<{ Params: { slug: string } }>(
    "/widget/:slug/message",
    async (req, reply) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
          return reply.status(401).send({ error: "Unauthenticated" });
        }

        const token = authHeader.slice(7);
        let payload: { sub: string; tid: string; role: string; cid: string };

        try {
          payload = jwt.verify(token, config.JWT_SECRET) as typeof payload;
        } catch {
          return reply.status(401).send({ error: "Invalid token" });
        }

        if (payload.role !== "VISITOR") {
          return reply.status(403).send({ error: "Forbidden" });
        }

        const body = WidgetMessageSchema.safeParse(req.body);
        if (!body.success) {
          return reply.status(400).send({ error: "Invalid request", details: body.error.flatten() });
        }

        const { conversationId, payload: msgPayload } = body.data;

        const message = await messageService.create({
          conversationId,
          tenantId: payload.tid,
          senderType: "VISITOR",
          senderId: payload.sub,
          payload: msgPayload,
        });

        return reply.send(message);
      } catch (err) {
        if (err instanceof NotFoundError) {
          return reply.status(404).send({ error: err.message });
        }
        req.log.error(err);
        return reply.status(500).send({ error: "Internal error" });
      }
    },
  );
}
