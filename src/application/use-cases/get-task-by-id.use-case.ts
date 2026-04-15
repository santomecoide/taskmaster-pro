import type { TaskRepository } from "../../domain/repositories/task.repository.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { type TaskResponseDto, toTaskResponseDto } from "../dtos/task.dto.js";

/**
 * Retrieve a single task by its unique identifier.
 */
export class GetTaskByIdUseCase {
  constructor(private readonly repo: TaskRepository) {}

  /**
   * Execute the use case.
   *
   * @param id - Task UUID.
   * @returns The matching task DTO.
   * @throws {NotFoundError} When no task matches the given id.
   */
  async execute(id: string): Promise<TaskResponseDto> {
    const task = await this.repo.findById(id);
    if (!task) {
      throw new NotFoundError("Task", id);
    }
    return toTaskResponseDto(task);
  }
}
