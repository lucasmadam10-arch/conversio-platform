import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../middleware";
import { authService } from "../../services/auth.service";
import { RegisterTenantSchema, LoginSchema, RefreshTokenSchema } from "@conversio/shared";

export const authRouter = router({
  register: publicProcedure
    .input(RegisterTenantSchema)
    .mutation(async ({ input }) => {
      return authService.registerTenant(input);
    }),

  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ input }) => {
      try {
        return await authService.login(input);
      } catch {
        // Don't expose whether tenant or user is the issue
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
    }),

  refresh: publicProcedure
    .input(RefreshTokenSchema)
    .mutation(async ({ input }) => {
      try {
        return await authService.refresh(input);
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired refresh token" });
      }
    }),

  logout: protectedProcedure
    .input(z.object({ refreshToken: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await authService.logout(input.refreshToken);
      return { ok: true };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return authService.me(ctx.auth.userId, ctx.auth.tenantId);
  }),
});
