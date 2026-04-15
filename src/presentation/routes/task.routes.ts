import { Router } from "express";
import type { TaskController } from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  getTasksQuerySchema,
} from "../schemas/task.schema.js";

/**
 * Build the task router with validation middleware wired to each endpoint.
 *
 * @param controller - Fully constructed TaskController.
 * @returns Express Router.
 */
export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.post("/", validate(createTaskSchema), controller.create);
  router.get("/", validate(getTasksQuerySchema), controller.getAll);
  router.get("/:id", validate(taskIdParamSchema), controller.getById);
  router.patch("/:id", validate(updateTaskSchema), controller.update);
  router.delete("/:id", validate(taskIdParamSchema), controller.delete);

  return router;
}
