// Type-only exports for other packages (e.g. dashboard)
export type { AppRouter } from "./trpc/router";

import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { config } from "./config";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/context";
import { healthRoutes } from "./rest/health.routes";
import { widgetRoutes } from "./rest/widget.routes";
import { internalRoutes } from "./rest/internal.routes";

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.NODE_ENV === "development"
      ? { transport: { target: "pino-pretty", options: { colorize: true } } }
      : {}),
  },
});

async function bootstrap() {
  // Plugins
  await app.register(cors, {
    origin: config.CORS_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Health check (no prefix)
  await app.register(healthRoutes);

  // Widget public API
  await app.register(widgetRoutes);

  // Internal API (service-to-service)
  await app.register(internalRoutes, { prefix: "/internal" });

  // tRPC API
  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ error }: { error: Error }) {
        app.log.error(error);
      },
    },
  });

  // Global error handler
  app.setErrorHandler((error, _req, reply) => {
    app.log.error(error);

    if ("statusCode" in error && typeof error.statusCode === "number") {
      return reply.status(error.statusCode).send({
        error: error.message,
        code: "code" in error ? error.code : "UNKNOWN",
      });
    }

    return reply.status(500).send({ error: "Internal server error" });
  });

  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`API running on port ${config.PORT}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
