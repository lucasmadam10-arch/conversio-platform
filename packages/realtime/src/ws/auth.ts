import * as jwt from "jsonwebtoken";
import type { AuthContext } from "@conversio/shared";
import { config } from "../config";

export type WsAuthContext = AuthContext & {
  conversationId?: string; // for widget tokens
};

export function verifyWsToken(token: string): WsAuthContext | null {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as {
      sub: string;
      tid: string;
      role: string;
      cid?: string;
    };

    return {
      userId: payload.sub,
      tenantId: payload.tid,
      role: payload.role as AuthContext["role"],
      conversationId: payload.cid,
    };
  } catch {
    return null;
  }
}
