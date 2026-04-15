import { jest } from "@jest/globals";
import express, { type Express } from "express";
import { Task, type TaskProps } from "../domain/entities/task.entity.js";
import type { TaskRepository } from "../domain/repositories/task.repository.js";
import { CreateTaskUseCase } from "../application/use-cases/create-task.use-case.js";
import { GetAllTasksUseCase } from "../application/use-cases/get-all-tasks.use-case.js";
import { GetTaskByIdUseCase } from "../application/use-cases/get-task-by-id.use-case.js";
import { UpdateTaskUseCase } from "../application/use-cases/update-task.use-case.js";
import { DeleteTaskUseCase } from "../application/use-cases/delete-task.use-case.js";
import { TaskController } from "../presentation/controllers/task.controller.js";
import { createTaskRouter } from "../presentation/routes/task.routes.js";
import { globalErrorHandler } from "../presentation/middleware/error-handler.middleware.js";

export const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
export const ANOTHER_UUID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
export const FIXED_DATE = new Date("2026-01-15T12:00:00.000Z");

/**
 * Create a Jest-mocked TaskRepository with all methods stubbed.
 */
export function createMockRepo(): jest.Mocked<TaskRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

/**
 * Build a Task domain entity from partial overrides.
 */
export function fakeTask(overrides: Partial<TaskProps> = {}): Task {
  return Task.create({
    id: VALID_UUID,
    title: "Test task",
    description: "A test task description",
    status: "pending",
    creationDate: FIXED_DATE,
    ...overrides,
  });
}

/**
 * Build a fully wired Express app backed by the given mock repository.
 * Mirrors the production composition root without touching real infrastructure.
 */
export function buildTestApp(repo: jest.Mocked<TaskRepository>): Express {
  const controller = new TaskController({
    createTask: new CreateTaskUseCase(repo),
    getAllTasks: new GetAllTasksUseCase(repo),
    getTaskById: new GetTaskByIdUseCase(repo),
    updateTask: new UpdateTaskUseCase(repo),
    deleteTask: new DeleteTaskUseCase(repo),
  });

  const app = express();
  app.use(express.json());
  app.use("/api/tasks", createTaskRouter(controller));
  app.use(globalErrorHandler);

  return app;
}
