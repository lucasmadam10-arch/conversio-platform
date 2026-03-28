import { z } from "zod";

const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  WS_PORT: z.coerce.number().default(3001),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  INTERNAL_API_KEY: z.string().min(16),
  API_URL: z.string().default("http://localhost:4000"),
  LOG_LEVEL: z.string().default("info"),
  WS_HEARTBEAT_INTERVAL: z.coerce.number().default(30000),
});

const parsed = ConfigSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid realtime configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
