import { PrismaClient } from "./generated/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash("password", SALT_ROUNDS);

  // Idempotent seed: upsert tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo",
      plan: "FREE",
      locale: "en",
      settings: {
        widgetColor: "#6366f1",
        widgetPosition: "bottom-right",
        widgetTitle: "Chat with us",
      },
      quotas: {
        conversations: 100,
        lyroConversations: 50,
        flowsVisitors: 1000,
      },
    },
  });

  console.log(`Tenant: ${tenant.slug} (${tenant.id})`);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@demo.local" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@demo.local",
      passwordHash,
      displayName: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin: ${admin.email} (${admin.id})`);

  // Agent user
  const agent = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "agent@demo.local" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "agent@demo.local",
      passwordHash,
      displayName: "Support Agent",
      role: "AGENT",
      status: "ACTIVE",
    },
  });

  console.log(`Agent: ${agent.email} (${agent.id})`);

  // Demo contact
  const contact = await prisma.contact.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: tenant.id,
      properties: { name: "Demo Visitor", email: "visitor@example.com" },
      tags: ["demo"],
    },
  });

  console.log(`Contact: ${contact.id}`);

  // Demo conversation
  const conversation = await prisma.conversation.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      tenantId: tenant.id,
      contactId: contact.id,
      channel: "WEB_CHAT",
      currentOwnerType: "UNASSIGNED",
      folder: "UNASSIGNED",
      status: "OPEN",
      subject: "Demo Conversation",
    },
  });

  console.log(`Conversation: ${conversation.id}`);

  // Seed messages
  const messages = [
    {
      conversationId: conversation.id,
      senderType: "VISITOR" as const,
      payload: { type: "text", content: "Hello! I need help with my order." },
    },
    {
      conversationId: conversation.id,
      senderType: "BOT" as const,
      payload: { type: "text", content: "Hi! I'd be happy to help. Could you provide your order number?" },
    },
    {
      conversationId: conversation.id,
      senderType: "VISITOR" as const,
      payload: { type: "text", content: "Sure, it's #12345." },
    },
  ];

  for (const msg of messages) {
    await prisma.message.create({ data: msg });
  }

  console.log(`Created ${messages.length} messages`);

  // LyroConfig (disabled by default)
  await prisma.lyroConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      enabled: false,
      channels: ["WEB_CHAT"],
      handoffPolicy: { online: "transfer", offline: "ticket" },
      limits: { confidenceThreshold: 0.7, maxConversationsPerDay: 100 },
    },
  });

  console.log("LyroConfig created (disabled)");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
