import type { Contact } from "@conversio/db";
import { prisma, Prisma } from "@conversio/db";
import { NotFoundError } from "@conversio/shared";
import { assertTenantMatch } from "@conversio/shared";

export class ContactRepository {
  async findById(tenantId: string, contactId: string): Promise<Contact> {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact || contact.deletedAt) throw new NotFoundError("Contact");
    assertTenantMatch(contact.tenantId, tenantId);
    return contact;
  }

  async findMany(
    tenantId: string,
    opts: { cursor?: string; limit?: number } = {},
  ): Promise<Contact[]> {
    const { cursor, limit = 20 } = opts;
    return prisma.contact.findMany({
      where: { tenantId, deletedAt: null },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    tenantId: string;
    properties?: Record<string, unknown>;
    externalIds?: Record<string, unknown>;
    tags?: string[];
  }): Promise<Contact> {
    return prisma.contact.create({
      data: {
        tenantId: data.tenantId,
        properties: (data.properties ?? {}) as Prisma.InputJsonValue,
        externalIds: (data.externalIds ?? {}) as Prisma.InputJsonValue,
        tags: data.tags ?? [],
      },
    });
  }

  async update(
    tenantId: string,
    contactId: string,
    data: {
      properties?: Record<string, unknown>;
      tags?: string[];
      lastSeenAt?: Date;
    },
  ): Promise<Contact> {
    const existing = await this.findById(tenantId, contactId);
    return prisma.contact.update({
      where: { id: existing.id },
      data: {
        ...(data.properties !== undefined && { properties: data.properties as Prisma.InputJsonValue }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.lastSeenAt !== undefined && { lastSeenAt: data.lastSeenAt }),
      },
    });
  }

  async findOrCreate(
    tenantId: string,
    externalId: string,
    externalIdType: string,
  ): Promise<Contact> {
    // Try to find by external ID
    const existing = await prisma.contact.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        externalIds: {
          path: [externalIdType],
          equals: externalId,
        },
      },
    });

    if (existing) return existing;

    return this.create({
      tenantId,
      externalIds: { [externalIdType]: externalId },
    });
  }
}

export const contactRepository = new ContactRepository();
