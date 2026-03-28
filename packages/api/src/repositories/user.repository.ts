import type { User } from "@conversio/db";
import { prisma } from "@conversio/db";
import { NotFoundError, ConflictError } from "@conversio/shared";
import { assertTenantMatch } from "@conversio/shared";

function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: unknown }).code === "P2002"
  );
}

export class UserRepository {
  async findById(tenantId: string, userId: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");
    assertTenantMatch(user.tenantId, tenantId);
    return user;
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
  }

  async create(data: {
    tenantId: string;
    email: string;
    passwordHash: string;
    displayName: string;
    role: "SUPER_ADMIN" | "ADMIN" | "AGENT";
  }): Promise<User> {
    try {
      return await prisma.user.create({ data });
    } catch (e) {
      if (isPrismaUniqueError(e)) {
        throw new ConflictError(`User with email "${data.email}" already exists`);
      }
      throw e;
    }
  }

  async findMany(tenantId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { tenantId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const userRepository = new UserRepository();
