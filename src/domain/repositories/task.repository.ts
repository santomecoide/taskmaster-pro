import type { Task } from "../entities/task.entity.js";
import type { TaskStatus } from "../../shared/constants.js";

/** Input for creating a new task (id and creationDate are generated). */
export interface CreateTaskInput {
  readonly title: string;
  readonly description: string;
  readonly status?: TaskStatus;
}

/**
 * Port defining persistence operations for Task entities.
 * Implementations live in the infrastructure layer.
 */
export interface TaskRepository {
  /** Persist a new task and return the created entity. */
  create(input: CreateTaskInput): Promise<Task>;

  /** Find a task by its unique identifier, or return undefined. */
  findById(id: string): Promise<Task | undefined>;

  /** Return all tasks, optionally filtered by status. */
  findAll(status?: TaskStatus): Promise<Task[]>;

  /** Update a task's mutable fields and return the updated entity. */
  update(id: string, data: Partial<Pick<Task, "title" | "description" | "status">>): Promise<Task>;

  /** Delete a task by id. Returns true if the task existed. */
  delete(id: string): Promise<boolean>;
}
