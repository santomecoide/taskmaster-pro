import type { TaskRepository } from "../../domain/repositories/task.repository.js";
import type { TaskStatus } from "../../shared/constants.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { type TaskResponseDto, toTaskResponseDto } from "../dtos/task.dto.js";

export interface UpdateTaskCommand {
  readonly title?: string;
  readonly description?: string;
  readonly status?: TaskStatus;
}

/**
 * Update mutable fields of an existing task.
 */
export class UpdateTaskUseCase {
  constructor(private readonly repo: TaskRepository) {}

  /**
   * Execute the use case.
   *
   * @param id - Task UUID.
   * @param command - Partial update payload (at least one field).
   * @returns The updated task DTO.
   * @throws {NotFoundError} When no task matches the given id.
   */
  async execute(id: string, command: UpdateTaskCommand): Promise<TaskResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("Task", id);
    }

    const task = await this.repo.update(id, command);
    return toTaskResponseDto(task);
  }
}
