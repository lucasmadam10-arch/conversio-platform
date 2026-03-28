// Types
export type {
  UserRole,
  JwtPayload,
  AuthContext,
  TokenPair,
  Channel,
  OwnerType,
  ConversationFolder,
  ConversationStatus,
  OrchestrationDecision,
  SenderType,
  MessagePayloadType,
  MessageAttachment,
  MessagePayload,
  ContactProperties,
} from "./types/index";

// Schemas
export {
  RegisterTenantSchema,
  LoginSchema,
  RefreshTokenSchema,
  CreateConversationSchema,
  UpdateConversationSchema,
  AssignConversationSchema,
  ListConversationsSchema,
  MessagePayloadSchema,
  CreateMessageSchema,
  ListMessagesSchema,
  PaginationSchema,
  CreateTicketSchema,
  UpdateTicketSchema,
  ListTicketsSchema,
} from "./schemas/index";

export type {
  RegisterTenantInput,
  LoginInput,
  RefreshTokenInput,
  CreateConversationInput,
  UpdateConversationInput,
  AssignConversationInput,
  ListConversationsInput,
  MessagePayloadInput,
  CreateMessageInput,
  ListMessagesInput,
  PaginationInput,
  CursorPage,
  CreateTicketInput,
  UpdateTicketInput,
  ListTicketsInput,
} from "./schemas/index";

// Errors
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  TenantIsolationError,
} from "./errors/index";

// Events
export {
  EventType,
  WsEventType,
} from "./events/index";

export type {
  EventTypeValue,
  DomainEvent,
  ConversationCreatedPayload,
  MessageReceivedPayload,
  ConversationOwnerChangedPayload,
  ConversationResolvedPayload,
} from "./events/index";

// Utils
export { assertTenantMatch, encodeCursor, decodeCursor, buildCursor, parseCursor } from "./utils/index";
