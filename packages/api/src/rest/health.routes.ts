import type { FastifyInstance } from "fastify";
import { prisma } from "@conversio/db";
import { redisConnection } from "../jobs/queue";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redisConnection.ping();
      return reply.send({ status: "ok", timestamp: new Date().toISOString() });
    } catch (err) {
      return reply.status(503).send({
        status: "degraded",
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  });
}
