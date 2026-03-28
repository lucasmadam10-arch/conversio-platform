import { z } from "zod";
import { router, protectedProcedure } from "../middleware";
import { ticketService } from "../../services/ticket.service";
import { CreateTicketSchema, UpdateTicketSchema, ListTicketsSchema } from "@conversio/shared";

export const ticketRouter = router({
  list: protectedProcedure
    .input(ListTicketsSchema)
    .query(async ({ ctx, input }) => {
      return ticketService.list(ctx.auth.tenantId, input);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ticketService.get(ctx.auth.tenantId, input.id);
    }),

  create: protectedProcedure
    .input(CreateTicketSchema)
    .mutation(async ({ ctx, input }) => {
      return ticketService.create(ctx.auth.tenantId, input, ctx.auth.userId);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: UpdateTicketSchema }))
    .mutation(async ({ ctx, input }) => {
      return ticketService.update(ctx.auth.tenantId, input.id, input.data, ctx.auth.userId);
    }),

  resolve: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ticketService.update(
        ctx.auth.tenantId,
        input.id,
        { state: "RESOLVED" },
        ctx.auth.userId,
      );
    }),

  close: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ticketService.update(
        ctx.auth.tenantId,
        input.id,
        { state: "CLOSED" },
        ctx.auth.userId,
      );
    }),
});
