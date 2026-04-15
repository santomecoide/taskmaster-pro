import type { TaskRepository } from "../../domain/repositories/task.repository.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

/**
 * Delete a task by its unique identifier.
 */
export class DeleteTaskUseCase {
  constructor(private readonly repo: TaskRepository) {}

  /**
   * Execute the use case.
   *
   * @param id - Task UUID.
   * @throws {NotFoundError} When no task matches the given id.
   */
  async execute(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError("Task", id);
    }
  }
}
