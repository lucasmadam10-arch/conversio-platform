import { router } from "./middleware";
import { authRouter } from "./routers/auth.router";
import { conversationRouter } from "./routers/conversation.router";
import { messageRouter } from "./routers/message.router";
import { contactRouter } from "./routers/contact.router";
import { ticketRouter } from "./routers/ticket.router";

export const appRouter = router({
  auth: authRouter,
  conversation: conversationRouter,
  message: messageRouter,
  contact: contactRouter,
  ticket: ticketRouter,
});

export type AppRouter = typeof appRouter;
