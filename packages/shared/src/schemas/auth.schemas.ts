import { z } from "zod";

export const RegisterTenantSchema = z.object({
  tenantName: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});

export type RegisterTenantInput = z.infer<typeof RegisterTenantSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().uuid(),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
