import { router, protectedProcedure } from "../middleware";
import { messageService } from "../../services/message.service";
import { CreateMessageSchema, ListMessagesSchema } from "@conversio/shared";

export const messageRouter = router({
  list: protectedProcedure
    .input(ListMessagesSchema)
    .query(async ({ ctx, input }) => {
      return messageService.list(ctx.auth.tenantId, input.conversationId, {
        cursor: input.cursor,
        limit: input.limit,
      });
    }),

  create: protectedProcedure
    .input(CreateMessageSchema)
    .mutation(async ({ ctx, input }) => {
      return messageService.create({
        conversationId: input.conversationId,
        tenantId: ctx.auth.tenantId,
        senderType: "AGENT",
        senderId: ctx.auth.userId,
        payload: input.payload,
      });
    }),
});
