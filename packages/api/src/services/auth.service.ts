import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "ioredis";
import type { TokenPair } from "@conversio/shared";
import { AuthenticationError } from "@conversio/shared";
import { prisma } from "@conversio/db";
import { tenantRepository } from "../repositories/tenant.repository";
import { userRepository } from "../repositories/user.repository";
import { config } from "../config";
import type { RegisterTenantInput, LoginInput, RefreshTokenInput } from "@conversio/shared";
import { publishEvent } from "../jobs/event-publisher";
import { EventType } from "@conversio/shared";

const redis = new Redis(config.REDIS_URL);

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function issueTokenPair(userId: string, tenantId: string, role: string): TokenPair {
  const accessToken = jwt.sign(
    { sub: userId, tid: tenantId, role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  const refreshToken = uuidv4();

  const refreshPayload = { sub: userId, tid: tenantId, role };
  redis.setex(
    `refresh:${refreshToken}`,
    REFRESH_TTL_SECONDS,
    JSON.stringify(refreshPayload),
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

export class AuthService {
  async registerTenant(input: RegisterTenantInput): Promise<TokenPair> {
    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.tenantName,
          slug: input.slug,
          plan: "FREE",
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: input.email,
          passwordHash,
          displayName: input.displayName,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });

      return { tenant, user };
    });

    await publishEvent({
      id: crypto.randomUUID(),
      tenantId: result.tenant.id,
      type: EventType.CONTACT_CREATED,
      payload: { userId: result.user.id, tenantId: result.tenant.id },
      ts: new Date().toISOString(),
      source: "auth-service",
    });

    return issueTokenPair(result.user.id, result.tenant.id, result.user.role);
  }

  async login(input: LoginInput): Promise<TokenPair> {
    const tenant = await tenantRepository.findBySlug(input.tenantSlug);
    const user = await userRepository.findByEmail(tenant.id, input.email);

    if (!user || user.status !== "ACTIVE") {
      throw new AuthenticationError("Invalid credentials");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError("Invalid credentials");
    }

    return issueTokenPair(user.id, tenant.id, user.role);
  }

  async refresh(input: RefreshTokenInput): Promise<TokenPair> {
    const stored = await redis.get(`refresh:${input.refreshToken}`);
    if (!stored) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }

    const payload = JSON.parse(stored) as { sub: string; tid: string; role: string };

    // Rotate: delete old token, issue new pair
    await redis.del(`refresh:${input.refreshToken}`);
    return issueTokenPair(payload.sub, payload.tid, payload.role);
  }

  async logout(refreshToken: string): Promise<void> {
    await redis.del(`refresh:${refreshToken}`);
  }

  async me(userId: string, tenantId: string) {
    return userRepository.findById(tenantId, userId);
  }
}

export const authService = new AuthService();
