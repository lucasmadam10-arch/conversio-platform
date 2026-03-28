# Claude Code Prompt — בניית פלטפורמת שירות לקוחות מבוססת AI (בהשראת Tidio)

---

## הפרומפט המלא — העתק והדבק ל-Claude Code:

---

```
You are building a multi-product customer service SaaS platform from scratch. This is a Tidio-like system — not just a chat widget, but a full conversation operating system combining live chat, multichannel inbox, ticketing, workflow automation, AI support agent with RAG, ecommerce integrations, and analytics.

## ARCHITECTURE OVERVIEW

The platform is built around ONE unified conversation domain model:
tenant → contact → conversation → event → automation/AI/human response

ALL responders (human agents, rule-based flows, AI agent) are first-class citizens operating on the SAME conversation graph. Never create separate tracks for bots vs humans.

### Core Services to Build (in priority order):

**MVP-1 — Conversation Kernel:**
1. Tenant/Auth Service — projects, users, roles, session auth, 2FA, permissions
2. Widget SDK + Web Widget — installable JS snippet chat launcher, async loading, project config download, session management via browser storage + server session ID
3. Conversation Service — threads, messages, participants, assignments, folders (Unassigned/Assigned/Resolved), status transitions
4. Realtime Gateway — WebSocket messaging with typing indicators, read receipts, presence tracking, ephemeral events separate from durable message history
5. Agent Inbox — unified operational surface with folders, filters, assignment states, smart views, reply composer, internal notes
6. Contact Store — contact properties, tags, notes, merge logic, anonymous-to-known identity progression

**MVP-2 — Operational Maturity:**
7. Ticketing Layer — convert chat/email to ticket, priority, ownership, SLA tracking, status workflow
8. Analytics Pipeline — conversation metrics, CSAT, visitor activity, operator performance, event ingestion
9. Email Ingress — email-to-ticket conversion, thread tracking

**MVP-3 — Automation Engine:**
10. Flow Engine — visual graph-based builder with node types:
    - Triggers: first visit, current page, visitor says (keyword), agent starts, another flow, widget click
    - Conditions: chat status, URL match, audience, operating hours
    - Actions: send message, form, notify agents, API call, set variable, create ticket
    - Control: delay (seconds to days), go-to-another-flow, stop, wait-for-input
    - Priority: Flows → AI Agent → Human Agents (this is the CRITICAL orchestration rule)
    - Each conversation tracks: active flow state, permitted interruption state, precedence rules
    - Flow runs store serialized execution state (current node, variables, timers, channel context)
    - Delays persisted separately from live chat sessions

**MVP-4 — AI Support Agent (Lyro-like):**
11. Knowledge Service:
    - Multi-source ingestion: manual Q&A, website URLs, whole-site scanning, CSV import, Zendesk import, file import, solved-chat extraction, ecommerce product sync
    - Pipeline: connector acquisition → normalization → chunking + metadata extraction → indexing (lexical + vector) → governance (usage flags, resync, deletion)
    - Source metadata and chunk lineage preserved all the way into response generation for citations
    
12. AI Orchestration Service:
    - RAG architecture with hybrid retrieval (lexical matching + embedding similarity + metadata filtering + confidence thresholds)
    - Layered prompt stack:
      Layer 1: System policy (safety, behavior constraints)
      Layer 2: Tenant guidance (brand voice, tone, emoji preferences, escalation rules)
      Layer 3: Conversation context (recent turns, channel, customer metadata)
      Layer 4: Knowledge layer (retrieved passages, Q&A records, product data)
      Layer 5: Tool/action contract (when to invoke Actions, how to gather inputs)
    - Retrieval sequence: detect intent → filter eligible knowledge (tenant/channel/audience) → hybrid search → re-rank → generate with citations if confident → fallback if not
    - Fallback chain:
      Strong confidence → answer with sources
      Needs external data → run Action after gathering required variables
      Ambiguous → ask clarifying question
      Visitor requests human → execute configured handoff policy
      No agents available → create ticket or offline flow
      Repeated failure → log as suggestion for admin review

13. Action Runner (Tool Calling):
    - Admin-defined action templates with: detailed instructions, input variables, API request nodes, output-variable mapping
    - Optional visitor confirmation before execution
    - Execution logs and audit trail
    - Output maps to Session Variables (conversation-scoped) or Contact Properties (persistent)
    - Secure connector layer for HTTP requests

14. AI Copilot — same knowledge/policy layer as customer-facing AI, different prompt shell and UI, assists agents with suggested replies

**MVP-5 — Multichannel & Integrations:**
15. Channel Adapters — Facebook Messenger, Instagram, WhatsApp, email
    - Channel normalization layer with fallback behaviors for varying message type support
    - Handle platform-specific: rate limits, reply windows, template approval, business verification
    
16. Integration Platform:
    - Three modes: channel integrations, business-system integrations (Shopify/WooCommerce/CRM), developer integrations
    - Developer surfaces: Widget SDK, OpenAPI, Webhooks, Mobile SDK
    - OAuth token management with refresh, scoped connections, health monitoring
    - Webhook delivery: event selection, secret verification, retry logic, delivery logging

17. Mobile SDK + Native Agent Apps

## TECH STACK

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Web Frontend | React + TypeScript + Tailwind | Complex dashboard SPA |
| Widget Frontend | TypeScript + Preact or lightweight runtime | Small payload, embeddable on third-party sites |
| Backend APIs | Node.js/TypeScript (or Go/Kotlin) | Good concurrency + ecosystem |
| Realtime | WebSockets over stateless gateway + Redis pub/sub (or NATS/Kafka) | Live fanout + presence |
| Primary DB | PostgreSQL | Relational consistency for core domains |
| Cache/Ephemeral | Redis | Presence, rate limiting, session hints |
| Search | OpenSearch/Elasticsearch | Full-text retrieval, logs, analytics |
| Vector Store | pgvector (or Pinecone/Weaviate) | AI knowledge retrieval |
| File Storage | S3-compatible | Attachments, imported documents |
| Workflow Scheduler | Temporal (or BullMQ for simpler needs) | Delays and long-running automations |
| Analytics | Event stream + ClickHouse (or BigQuery) | High-volume metrics |
| LLM Layer | Provider abstraction over OpenAI/Anthropic/Gemini | Vendor flexibility |
| Observability | OpenTelemetry + Prometheus/Grafana | Realtime + AI debugging |

## DATABASE SCHEMA (Core Entities)

Design these PostgreSQL tables with proper relations, indexes, and tenant scoping:

- tenant/project: id, plan, locale, settings (JSONB), quotas
- user: id, tenant_id, role, permissions, 2fa_enabled, status
- contact: id, tenant_id, external_ids (JSONB), properties (JSONB), tags[], created_at
- session: id, contact_id, channel, device_info, status, started_at
- conversation: id, tenant_id, channel, current_owner_type (flow|lyro|agent), current_owner_id, folder, status, created_at
- message: id, conversation_id, sender_type (visitor|agent|bot|system), sender_id, payload (JSONB), created_at
- ticket: id, conversation_id, tenant_id, priority, owner_id, state, sla_deadline
- flow_definition: id, tenant_id, version, graph_json (JSONB), settings, is_active
- flow_run: id, flow_definition_id, conversation_id, state_blob (JSONB), current_node, started_at
- lyro_config: tenant_id, channels[], handoff_policy (JSONB), guidance (text), limits (JSONB)
- knowledge_source: id, tenant_id, source_type (url|csv|qa|zendesk|product), url, status, audience_filter
- knowledge_chunk: id, source_id, content, metadata (JSONB), embedding_ref
- action_definition: id, tenant_id, instructions, sequence (JSONB), enabled, requires_confirmation
- action_run: id, action_definition_id, conversation_id, input (JSONB), output (JSONB), logs (JSONB)
- integration_connection: id, tenant_id, provider, auth_state (JSONB), scopes[], last_sync_at, health
- event_log: id, tenant_id, event_type, payload (JSONB), ts (timestamptz)
- usage_counter: tenant_id, metric_name, period, value

ALL tables must have tenant_id for multi-tenant isolation. Add proper indexes for common query patterns.

## STATE SCOPES (Critical Design Decision)

Maintain FOUR distinct state scopes:
1. Session Variables — current conversation only (collected answers, API outputs, active flow state)
2. Contact Properties — persistent customer profile (name, email, tags, purchase segment)  
3. Tenant/Project Config — global (routing rules, widget theme, active channels)
4. Agent/User Preferences — workspace (filters, saved views, notification prefs)

The automation engine evaluates conditions against a MERGED runtime context of all four scopes.

## CONVERSATION ORCHESTRATOR (Most Critical Component)

The orchestrator decides WHO responds to each conversation turn:
1. Check if an active Flow is running → Flow has priority
2. If no Flow, check if Lyro is enabled for this channel/audience → Lyro evaluates
3. If Lyro disabled/hands off/can't answer → route to human agents
4. Human takeover = state transition on conversation owner, NOT a separate thread

Flows can be proactive (trigger on visit) or reactive (trigger on message).
Lyro is reactive only.
Agents can manually join ANY conversation from the Lyro folder via "Join conversation".
Human takeover changes conversation.current_owner from "lyro" or "flow" to "agent:<id>" while retaining full history.

## EVENT BUS

Implement an internal event bus feeding: automation evaluation, AI routing, analytics aggregation, external webhook delivery.

Core events: visitor_session_started, page_viewed, widget_opened, message_received, message_sent, flow_triggered, flow_completed, lyro_started, lyro_handoff_requested, conversation_assigned, ticket_created, contact_updated, integration_sync_completed, csat_submitted

## SECURITY REQUIREMENTS

- Multi-tenant isolation at application + storage layer
- TLS everywhere, encryption at rest, hashed credentials
- 2FA support, role-based permissions
- GDPR/CCPA compliance: consent management, data deletion, retention policies
- Secret storage for integration tokens
- Scoped action execution with confirmation for mutating actions
- Audit logging, replay protection
- Per-tenant allowlists for external API access

## WIDGET IMPLEMENTATION

The web widget must:
- Load asynchronously via single JS snippet (like a tracking pixel)
- Download project config, branding, routing rules on init
- Create/resume visitor sessions using browser storage + server session ID
- Establish WebSocket connection for realtime messaging
- Support: pre-chat surveys, typing indicators, attachments, CSAT, operating hours, offline messages
- Expose Widget SDK for: open/close control, user identification, language management
- Handle edge cases: page reloads, tab suspension, device switches, poor network, file upload failures

## PRICING/BILLING MODEL

Implement hybrid usage-based billing:
- Plans: Free, Starter, Growth, Plus, Premium
- Metered dimensions: billable conversations, AI conversations, Flows visitors reached
- Feature gating: module availability, usage quotas, integration depth, AI capabilities, admin/governance features
- Usage counters must be accurate and real-time for billing

## DEVELOPMENT APPROACH

1. Start EVERY component with the data model and API contracts
2. Build the conversation kernel FIRST — everything depends on it
3. Use event-driven architecture from day one
4. Build AI observability and source review from day one (not an afterthought)
5. Every service must be tenant-aware from the first line of code
6. Test orchestration edge cases obsessively: what happens when Flow + Lyro + Agent all try to respond?
7. Treat the flow engine and AI agent as expressions of the SAME conversation model

## PROJECT STRUCTURE

Organize as a monorepo:
/packages
  /shared          — types, utils, event definitions
  /db              — schema, migrations, seeds
  /api             — main backend API service
  /realtime        — WebSocket gateway
  /widget          — embeddable chat widget
  /dashboard       — agent/admin SPA
  /flow-engine     — automation runtime
  /ai-service      — knowledge ingestion, RAG, Lyro orchestration
  /action-runner   — external API tool calling
  /integrations    — channel adapters, OAuth, webhooks
  /analytics       — event pipeline, dashboards
  /mobile-sdk      — React Native or native SDK

Start with MVP-1. Get conversations flowing between widget and inbox before building anything else.
```

---

## הערות שימוש

- **העתק את כל הבלוק** שבתוך ה-``` והדבק אותו כפרומפט ראשי ב-Claude Code
- הפרומפט מכיל את **כל האדריכלות, סכמת הנתונים, סדר הבנייה, וה-Edge Cases** מהמסמך המקורי
- הוא מבנה את העבודה ב-**5 שלבי MVP** כדי שהבנייה תהיה מסודרת ולא כאוטית
- הנקודה הכי קריטית: **כל הרספונדרים (בוט, AI, אדם) עובדים על אותו גרף שיחה** — זה הדבר שעושה את ההבדל בין מוצר טוב למוצר שבור
