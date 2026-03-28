import type { FastifyRequest } from "fastify";
import * as jwt from "jsonwebtoken";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { prisma } from "@conversio/db";
import type { AuthContext } from "@conversio/shared";
import { config } from "../config";

export type Context = {
  auth: AuthContext | null;
  req: FastifyRequest;
};

export async function createContext({
  req,
}: CreateFastifyContextOptions): Promise<Context> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return { auth: null, req };
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as {
      sub: string;
      tid: string;
      role: string;
    };

    const auth: AuthContext = {
      userId: payload.sub,
      tenantId: payload.tid,
      role: payload.role as AuthContext["role"],
    };

    return { auth, req };
  } catch {
    return { auth: null, req };
  }
}

export { prisma };
