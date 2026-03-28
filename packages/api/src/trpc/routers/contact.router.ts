import { z } from "zod";
import { router, protectedProcedure } from "../middleware";
import { contactRepository } from "../../repositories/contact.repository";
import { PaginationSchema } from "@conversio/shared";

export const contactRouter = router({
  list: protectedProcedure
    .input(PaginationSchema)
    .query(async ({ ctx, input }) => {
      const items = await contactRepository.findMany(ctx.auth.tenantId, {
        cursor: input.cursor,
        limit: input.limit,
      });
      return { items, hasMore: items.length === input.limit };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return contactRepository.findById(ctx.auth.tenantId, input.id);
    }),
});
