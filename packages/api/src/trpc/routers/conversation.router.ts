import { z } from "zod";
import { router, protectedProcedure } from "../middleware";
import { conversationService } from "../../services/conversation.service";
import {
  CreateConversationSchema,
  AssignConversationSchema,
  ListConversationsSchema,
} from "@conversio/shared";

export const conversationRouter = router({
  list: protectedProcedure
    .input(ListConversationsSchema)
    .query(async ({ ctx, input }) => {
      return conversationService.list(ctx.auth.tenantId, input);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return conversationService.get(ctx.auth.tenantId, input.id);
    }),

  create: protectedProcedure
    .input(CreateConversationSchema)
    .mutation(async ({ ctx, input }) => {
      return conversationService.create(ctx.auth.tenantId, input);
    }),

  assign: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        assignment: AssignConversationSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return conversationService.assign(
        ctx.auth.tenantId,
        input.id,
        input.assignment,
        ctx.auth.userId,
      );
    }),

  resolve: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return conversationService.resolve(
        ctx.auth.tenantId,
        input.id,
        ctx.auth.userId,
      );
    }),
});
