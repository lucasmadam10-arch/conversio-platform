
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  plan: 'plan',
  locale: 'locale',
  settings: 'settings',
  quotas: 'quotas',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  email: 'email',
  passwordHash: 'passwordHash',
  displayName: 'displayName',
  role: 'role',
  permissions: 'permissions',
  twoFaEnabled: 'twoFaEnabled',
  twoFaSecret: 'twoFaSecret',
  status: 'status',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  externalIds: 'externalIds',
  properties: 'properties',
  tags: 'tags',
  notes: 'notes',
  firstSeenAt: 'firstSeenAt',
  lastSeenAt: 'lastSeenAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  contactId: 'contactId',
  channel: 'channel',
  deviceInfo: 'deviceInfo',
  status: 'status',
  metadata: 'metadata',
  startedAt: 'startedAt',
  endedAt: 'endedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  contactId: 'contactId',
  channel: 'channel',
  currentOwnerType: 'currentOwnerType',
  currentOwnerId: 'currentOwnerId',
  folder: 'folder',
  status: 'status',
  subject: 'subject',
  sessionVars: 'sessionVars',
  metadata: 'metadata',
  csatScore: 'csatScore',
  csatComment: 'csatComment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  resolvedAt: 'resolvedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderType: 'senderType',
  senderId: 'senderId',
  payload: 'payload',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  conversationId: 'conversationId',
  subject: 'subject',
  priority: 'priority',
  ownerId: 'ownerId',
  state: 'state',
  source: 'source',
  slaDeadline: 'slaDeadline',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  resolvedAt: 'resolvedAt'
};

exports.Prisma.FlowDefinitionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  version: 'version',
  graphJson: 'graphJson',
  settings: 'settings',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlowRunScalarFieldEnum = {
  id: 'id',
  flowDefinitionId: 'flowDefinitionId',
  conversationId: 'conversationId',
  currentNode: 'currentNode',
  stateBlob: 'stateBlob',
  status: 'status',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.LyroConfigScalarFieldEnum = {
  tenantId: 'tenantId',
  enabled: 'enabled',
  channels: 'channels',
  handoffPolicy: 'handoffPolicy',
  guidance: 'guidance',
  limits: 'limits',
  audienceFilter: 'audienceFilter',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KnowledgeSourceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  sourceType: 'sourceType',
  name: 'name',
  url: 'url',
  config: 'config',
  status: 'status',
  audienceFilter: 'audienceFilter',
  lastSyncAt: 'lastSyncAt',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KnowledgeChunkScalarFieldEnum = {
  id: 'id',
  sourceId: 'sourceId',
  content: 'content',
  metadata: 'metadata',
  embeddingRef: 'embeddingRef',
  chunkIndex: 'chunkIndex',
  createdAt: 'createdAt'
};

exports.Prisma.ActionDefinitionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  description: 'description',
  instructions: 'instructions',
  sequence: 'sequence',
  inputSchema: 'inputSchema',
  outputMapping: 'outputMapping',
  requiresConfirmation: 'requiresConfirmation',
  enabled: 'enabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActionRunScalarFieldEnum = {
  id: 'id',
  actionDefinitionId: 'actionDefinitionId',
  conversationId: 'conversationId',
  input: 'input',
  output: 'output',
  logs: 'logs',
  status: 'status',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.IntegrationConnectionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  provider: 'provider',
  authState: 'authState',
  config: 'config',
  scopes: 'scopes',
  health: 'health',
  lastSyncAt: 'lastSyncAt',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  eventType: 'eventType',
  payload: 'payload',
  ts: 'ts'
};

exports.Prisma.UsageCounterScalarFieldEnum = {
  tenantId: 'tenantId',
  metricName: 'metricName',
  period: 'period',
  value: 'value'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Plan = exports.$Enums.Plan = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
  PLUS: 'PLUS',
  PREMIUM: 'PREMIUM'
};

exports.UserRole = exports.$Enums.UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  AGENT: 'AGENT'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INVITED: 'INVITED',
  DISABLED: 'DISABLED'
};

exports.Channel = exports.$Enums.Channel = {
  WEB_CHAT: 'WEB_CHAT',
  MESSENGER: 'MESSENGER',
  INSTAGRAM: 'INSTAGRAM',
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
  API: 'API'
};

exports.SessionStatus = exports.$Enums.SessionStatus = {
  ACTIVE: 'ACTIVE',
  IDLE: 'IDLE',
  ENDED: 'ENDED'
};

exports.OwnerType = exports.$Enums.OwnerType = {
  UNASSIGNED: 'UNASSIGNED',
  AGENT: 'AGENT',
  FLOW: 'FLOW',
  LYRO: 'LYRO',
  SYSTEM: 'SYSTEM'
};

exports.ConversationFolder = exports.$Enums.ConversationFolder = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  LYRO: 'LYRO',
  RESOLVED: 'RESOLVED',
  SPAM: 'SPAM'
};

exports.ConversationStatus = exports.$Enums.ConversationStatus = {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.SenderType = exports.$Enums.SenderType = {
  VISITOR: 'VISITOR',
  AGENT: 'AGENT',
  BOT: 'BOT',
  LYRO: 'LYRO',
  SYSTEM: 'SYSTEM'
};

exports.TicketPriority = exports.$Enums.TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.TicketState = exports.$Enums.TicketState = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_ON_CUSTOMER: 'WAITING_ON_CUSTOMER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.TicketSource = exports.$Enums.TicketSource = {
  CHAT: 'CHAT',
  EMAIL: 'EMAIL',
  MANUAL: 'MANUAL',
  AI_HANDOFF: 'AI_HANDOFF'
};

exports.FlowRunStatus = exports.$Enums.FlowRunStatus = {
  RUNNING: 'RUNNING',
  WAITING_INPUT: 'WAITING_INPUT',
  WAITING_DELAY: 'WAITING_DELAY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ERRORED: 'ERRORED'
};

exports.KnowledgeSourceType = exports.$Enums.KnowledgeSourceType = {
  WEBSITE_URL: 'WEBSITE_URL',
  WEBSITE_SITEMAP: 'WEBSITE_SITEMAP',
  MANUAL_QA: 'MANUAL_QA',
  CSV_IMPORT: 'CSV_IMPORT',
  ZENDESK_IMPORT: 'ZENDESK_IMPORT',
  FILE_UPLOAD: 'FILE_UPLOAD',
  SOLVED_CHATS: 'SOLVED_CHATS',
  PRODUCT_CATALOG: 'PRODUCT_CATALOG'
};

exports.IngestionStatus = exports.$Enums.IngestionStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  ERROR: 'ERROR',
  RESYNCING: 'RESYNCING'
};

exports.ActionRunStatus = exports.$Enums.ActionRunStatus = {
  PENDING: 'PENDING',
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.IntegrationHealth = exports.$Enums.IntegrationHealth = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR'
};

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  User: 'User',
  Contact: 'Contact',
  Session: 'Session',
  Conversation: 'Conversation',
  Message: 'Message',
  Ticket: 'Ticket',
  FlowDefinition: 'FlowDefinition',
  FlowRun: 'FlowRun',
  LyroConfig: 'LyroConfig',
  KnowledgeSource: 'KnowledgeSource',
  KnowledgeChunk: 'KnowledgeChunk',
  ActionDefinition: 'ActionDefinition',
  ActionRun: 'ActionRun',
  IntegrationConnection: 'IntegrationConnection',
  EventLog: 'EventLog',
  UsageCounter: 'UsageCounter'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
