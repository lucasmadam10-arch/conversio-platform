import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { config } from "./config";
import { registerGateway } from "./ws/gateway";

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.NODE_ENV === "development"
      ? { transport: { target: "pino-pretty", options: { colorize: true } } }
      : {}),
  },
});

async function bootstrap() {
  await app.register(websocket);
  await registerGateway(app);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  await app.listen({ port: config.WS_PORT, host: "0.0.0.0" });
  app.log.info(`Realtime gateway running on port ${config.WS_PORT}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start realtime gateway:", err);
  process.exit(1);
});
