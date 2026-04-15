import type { Request, Response, NextFunction } from "express";
import type { CreateTaskUseCase } from "../../application/use-cases/create-task.use-case.js";
import type { GetAllTasksUseCase } from "../../application/use-cases/get-all-tasks.use-case.js";
import type { GetTaskByIdUseCase } from "../../application/use-cases/get-task-by-id.use-case.js";
import type { UpdateTaskUseCase } from "../../application/use-cases/update-task.use-case.js";
import type { DeleteTaskUseCase } from "../../application/use-cases/delete-task.use-case.js";
import type { TaskStatus } from "../../shared/constants.js";

interface TaskUseCases {
  readonly createTask: CreateTaskUseCase;
  readonly getAllTasks: GetAllTasksUseCase;
  readonly getTaskById: GetTaskByIdUseCase;
  readonly updateTask: UpdateTaskUseCase;
  readonly deleteTask: DeleteTaskUseCase;
}

/**
 * HTTP controller that delegates request handling to application use cases.
 * All methods follow the async handler pattern with next(error) propagation.
 */
export class TaskController {
  private readonly useCases: TaskUseCases;

  constructor(useCases: TaskUseCases) {
    this.useCases = useCases;
  }

  /** POST /tasks */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = await this.useCases.createTask.execute(req.body);
      res.status(201).json({ status: "success", data: dto });
    } catch (error) {
      next(error);
    }
  };

  /** GET /tasks  — supports ?status=pending|completed */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as TaskStatus | undefined;
      const dtos = await this.useCases.getAllTasks.execute(status);
      res.json({ status: "success", data: dtos });
    } catch (error) {
      next(error);
    }
  };

  /** GET /tasks/:id */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = await this.useCases.getTaskById.execute(req.params.id);
      res.json({ status: "success", data: dto });
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /tasks/:id */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = await this.useCases.updateTask.execute(req.params.id, req.body);
      res.json({ status: "success", data: dto });
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /tasks/:id */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.useCases.deleteTask.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
