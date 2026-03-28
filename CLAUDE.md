# CLAUDE.md — Tidio-like Customer Service Platform

## Project Identity
This is a multi-product customer service SaaS platform. Not just a chat widget — a full conversation operating system combining live chat, multichannel inbox, ticketing, workflow automation, AI support agent with RAG, ecommerce integrations, and analytics.

## Golden Rule
ALL responders (human agents, rule-based Flows, AI agent "Lyro") operate on the SAME conversation graph. Never create separate tracks for bots vs humans. The unified domain model is:
**tenant → contact → conversation → event → automation/AI/human response**

## Orchestration Priority (CRITICAL)
When a message arrives, the orchestrator checks in this exact order:
1. **Flows first** — is there an active or matching triggered Flow?
2. **AI Agent second** — is Lyro enabled for this channel/audience?
3. **Human agents third** — route to Unassigned or auto-assign
Human takeover = state transition on `conversation.current_owner`, NOT a new thread.

## Tech Stack
- **Monorepo**: pnpm workspaces
- **Language**: TypeScript everywhere (frontend + backend)
- **Backend**: Node.js + Fastify + tRPC (or REST where needed)
- **Realtime**: WebSocket gateway with Redis pub/sub backplane
- **Database**: PostgreSQL (via Prisma ORM) + Redis (cache/ephemeral)
- **Search**: OpenSearch (full-text) + pgvector (embeddings)
- **Queue/Scheduler**: BullMQ (Redis-based) for jobs, delays, retries
- **Frontend Dashboard**: React + TypeScript + Tailwind + Zustand
- **Widget**: TypeScript + Preact (small bundle, embeddable)
- **LLM**: Anthropic Claude API with provider abstraction layer
- **File Storage**: S3-compatible (MinIO for local dev)
- **Analytics**: ClickHouse for event analytics
- **Observability**: OpenTelemetry + Pino logger

## Project Structure
```
/
├── packages/
│   ├── shared/          # Types, utils, event definitions, validation schemas
│   ├── db/              # Prisma schema, migrations, seeds
│   ├── api/             # Main backend API (Fastify + tRPC)
│   ├── realtime/        # WebSocket gateway service
│   ├── widget/          # Embeddable chat widget (Preact)
│   ├── dashboard/       # Agent/admin SPA (React)
│   ├── flow-engine/     # Automation runtime (graph executor)
│   ├── ai-service/      # Knowledge ingestion, RAG, AI orchestration
│   ├── action-runner/   # External API tool calling for AI actions
│   ├── integrations/    # Channel adapters, OAuth, webhooks
│   ├── analytics/       # Event pipeline + ClickHouse writer
│   └── mobile-sdk/      # React Native SDK (later phase)
├── infra/               # Docker, docker-compose, k8s manifests
├── scripts/             # Dev scripts, data seeding, migration helpers
├── .env.example
├── CLAUDE.md            # This file
├── package.json         # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── turbo.json
```

## State Scopes (Never mix these)
| Scope | Lifetime | Examples |
|-------|----------|---------|
| Session Variables | Current conversation only | Collected form answers, API response data, active flow node |
| Contact Properties | Persistent across conversations | Name, email, tags, purchase segment, lifetime value |
| Tenant Config | Global project settings | Routing rules, widget theme, active channels, business hours |
| Agent Preferences | Per-agent workspace | Inbox filters, saved views, notification settings |

The automation engine merges all four scopes into a runtime context for condition evaluation.

## Database Conventions
- Every table has `tenant_id` — multi-tenant isolation is non-negotiable
- Use UUIDs for all primary keys (except `usage_counter` which is composite)
- Timestamps: `created_at`, `updated_at` with `timestamptz`
- JSONB for flexible fields: `properties`, `settings`, `payload`, `metadata`
- Soft delete with `deleted_at` where needed (contacts, conversations)
- Row-level security or application-layer tenant checks on every query

## Event Bus Pattern
All domain events flow through a centralized event bus (Redis Streams or BullMQ):
```
visitor_session_started | page_viewed | widget_opened
message_received | message_sent
flow_triggered | flow_completed
lyro_started | lyro_handoff_requested
conversation_assigned | conversation_resolved
ticket_created | ticket_updated
contact_updated | contact_merged
csat_submitted
integration_sync_completed
```
Consumers: flow engine, AI routing, analytics aggregation, webhook delivery, notification service.

## AI Architecture
- **Knowledge ingestion**: URL scraping → normalization → chunking → embed + index
- **Retrieval**: hybrid search (lexical + vector + metadata filter) → re-rank → confidence gate
- **Prompt stack** (5 layers): system policy → tenant guidance → conversation context → retrieved knowledge → tool/action contracts
- **Actions** = admin-defined API tool templates with input collection, confirmation, execution, output mapping
- **Fallback chain**: confident answer → run action → clarify → handoff → ticket → log suggestion

## Code Style
- Strict TypeScript (`strict: true`, no `any`)
- Zod for all runtime validation (API inputs, event payloads, config)
- Explicit error handling — no swallowed promises
- Every API endpoint is tenant-scoped (extracted from auth context)
- Prefer composition over inheritance
- Service layer pattern: Controller → Service → Repository
- All business logic in service layer, never in controllers or routes

## Testing Strategy
- Unit tests for: orchestrator logic, flow engine state machine, retrieval scoring, permission checks
- Integration tests for: conversation lifecycle, message routing, handoff transitions, Action execution
- E2E tests for: widget → gateway → inbox → reply → widget round-trip
- Load tests for: WebSocket concurrent connections, message throughput

## Security Checklist
- [ ] TLS everywhere (even internal service-to-service in production)
- [ ] Credentials hashed with bcrypt/argon2
- [ ] JWT + refresh token rotation for auth
- [ ] 2FA support (TOTP)
- [ ] Role-based access control on every endpoint
- [ ] Integration secrets encrypted at rest (AES-256 via envelope encryption)
- [ ] Rate limiting on all public endpoints
- [ ] Input sanitization against XSS in chat messages
- [ ] GDPR: data export, deletion, consent tracking, retention policies
- [ ] Audit log for admin actions and AI action executions
- [ ] CSP headers on widget to prevent injection

## Build Order (Follow This Sequence)
### Phase 1: Conversation Kernel
tenant auth → conversation CRUD → message persistence → WebSocket gateway → basic widget → basic inbox

### Phase 2: Operational Maturity  
ticketing → email ingress → CSAT → agent permissions → conversation filters → basic analytics

### Phase 3: Automation
flow definition schema → flow builder UI → trigger evaluation → flow runtime executor → delay scheduler

### Phase 4: AI Agent
knowledge source CRUD → ingestion pipeline → vector indexing → RAG retrieval → response generation → handoff logic → playground UI → action runner

### Phase 5: Multichannel & Integrations
Messenger adapter → Instagram adapter → WhatsApp adapter → OAuth framework → webhook delivery → OpenAPI surface

## Common Pitfalls to Avoid
- ❌ Building AI before the conversation kernel works end-to-end
- ❌ Separate message stores for bot vs human conversations
- ❌ Hardcoding channel-specific logic in the conversation service
- ❌ Treating flow execution as synchronous (delays can span days)
- ❌ Forgetting tenant_id in any database query
- ❌ Storing integration secrets in plaintext
- ❌ Making the widget bundle > 50KB gzipped
- ❌ Polling instead of WebSockets for realtime features
