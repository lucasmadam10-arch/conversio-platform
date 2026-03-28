export type UserRole = "SUPER_ADMIN" | "ADMIN" | "AGENT" | "VISITOR";

export type JwtPayload = {
  sub: string; // userId or visitorId
  tid: string; // tenantId
  role: UserRole;
  iat: number;
  exp: number;
};

export type AuthContext = {
  userId: string;
  tenantId: string;
  role: UserRole;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
