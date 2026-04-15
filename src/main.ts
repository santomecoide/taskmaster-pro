import "dotenv/config";
import express from "express";
import { getPrismaClient, disconnectPrisma } from "./infrastructure/persistence/prisma.client.js";
import { PrismaTaskRepository } from "./infrastructure/persistence/prisma-task.repository.js";
import { CreateTaskUseCase } from "./application/use-cases/create-task.use-case.js";
import { GetAllTasksUseCase } from "./application/use-cases/get-all-tasks.use-case.js";
import { GetTaskByIdUseCase } from "./application/use-cases/get-task-by-id.use-case.js";
import { UpdateTaskUseCase } from "./application/use-cases/update-task.use-case.js";
import { DeleteTaskUseCase } from "./application/use-cases/delete-task.use-case.js";
import { TaskController } from "./presentation/controllers/task.controller.js";
import { createTaskRouter } from "./presentation/routes/task.routes.js";
import { globalErrorHandler } from "./presentation/middleware/error-handler.middleware.js";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  const prisma = getPrismaClient();
  const taskRepo = new PrismaTaskRepository(prisma);

  const controller = new TaskController({
    createTask: new CreateTaskUseCase(taskRepo),
    getAllTasks: new GetAllTasksUseCase(taskRepo),
    getTaskById: new GetTaskByIdUseCase(taskRepo),
    updateTask: new UpdateTaskUseCase(taskRepo),
    deleteTask: new DeleteTaskUseCase(taskRepo),
  });

  const app = express();

  app.use(express.json());
  app.use("/api/tasks", createTaskRouter(controller));
  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    console.info("Shutting down…");
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
