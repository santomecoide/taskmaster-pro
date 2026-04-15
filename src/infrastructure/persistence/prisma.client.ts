import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

let instance: PrismaClient | undefined;

/**
 * Return a singleton PrismaClient instance backed by better-sqlite3.
 * Prevents multiple connections during hot-reload in development.
 *
 * @returns The shared PrismaClient instance.
 */
export function getPrismaClient(): PrismaClient {
  if (!instance) {
    const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
    const adapter = new PrismaBetterSqlite3({ url: connectionString });
    instance = new PrismaClient({ adapter });
  }
  return instance;
}

/**
 * Gracefully disconnect the Prisma client.
 * Call during application shutdown.
 */
export async function disconnectPrisma(): Promise<void> {
  if (instance) {
    await instance.$disconnect();
    instance = undefined;
  }
}
