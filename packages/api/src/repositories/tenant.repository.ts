import type { Tenant } from "@conversio/db";
import { prisma } from "@conversio/db";
import { NotFoundError, ConflictError } from "@conversio/shared";

function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: unknown }).code === "P2002"
  );
}

export class TenantRepository {
  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundError("Tenant");
    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundError("Tenant");
    return tenant;
  }

  async create(data: {
    name: string;
    slug: string;
    plan?: "FREE" | "STARTER" | "GROWTH" | "PLUS" | "PREMIUM";
  }): Promise<Tenant> {
    try {
      return await prisma.tenant.create({ data });
    } catch (e) {
      if (isPrismaUniqueError(e)) {
        throw new ConflictError(`Tenant slug "${data.slug}" is already taken`);
      }
      throw e;
    }
  }
}

export const tenantRepository = new TenantRepository();
