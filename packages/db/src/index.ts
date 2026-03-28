export { prisma } from "./client";
export type { PrismaTransactionClient } from "./client";
export { Prisma } from "./generated/client";

// Re-export all Prisma types and enums
export type {
  Tenant,
  User,
  Contact,
  Session,
  Conversation,
  Message,
  Ticket,
  FlowDefinition,
  FlowRun,
  LyroConfig,
  KnowledgeSource,
  KnowledgeChunk,
  ActionDefinition,
  ActionRun,
  IntegrationConnection,
  EventLog,
} from "./generated/client";

export {
  Plan,
  UserRole,
  UserStatus,
  Channel,
  SessionStatus,
  OwnerType,
  ConversationFolder,
  ConversationStatus,
  SenderType,
  TicketPriority,
  TicketState,
  TicketSource,
  FlowRunStatus,
  ActionRunStatus,
  KnowledgeSourceType,
  IngestionStatus,
  IntegrationHealth,
} from "./generated/client";
