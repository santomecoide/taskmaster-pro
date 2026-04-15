import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const tasks = [
    {
      title: "Set up project structure",
      description: "Initialize the Node.js project with TypeScript and Clean Architecture layers.",
      status: "completed",
    },
    {
      title: "Define data model",
      description: "Create the Prisma schema with Task model and run initial migration.",
      status: "completed",
    },
    {
      title: "Implement use cases",
      description: "Build CRUD use cases for the Task entity in the application layer.",
      status: "pending",
    },
    {
      title: "Add REST API endpoints",
      description: "Create Express/Fastify routes for task management.",
      status: "pending",
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  const count = await prisma.task.count();
  console.info(`Seeded ${count} tasks.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
