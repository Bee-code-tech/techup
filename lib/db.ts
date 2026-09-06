import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Bump when models are added so hot-reload drops stale clients. */
const PRISMA_SCHEMA_VERSION = 2;

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (
    globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION ||
    !globalForPrisma.prisma ||
    typeof (globalForPrisma.prisma as { passwordResetToken?: unknown })
      .passwordResetToken === "undefined"
  ) {
    if (globalForPrisma.prisma) {
      void globalForPrisma.prisma.$disconnect().catch(() => undefined);
    }
    globalForPrisma.prisma = createClient();
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }

  return globalForPrisma.prisma;
}

/**
 * Lazy proxy so hot-reload never keeps calling methods on a stale client
 * that was created before new Prisma models existed.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
