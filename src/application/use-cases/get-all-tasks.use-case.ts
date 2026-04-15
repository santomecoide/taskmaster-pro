import type { TaskRepository } from "../../domain/repositories/task.repository.js";
import type { TaskStatus } from "../../shared/constants.js";
import { type TaskResponseDto, toTaskResponseDto } from "../dtos/task.dto.js";

/**
 * Retrieve all tasks, optionally filtered by status.
 */
export class GetAllTasksUseCase {
  constructor(private readonly repo: TaskRepository) {}

  /**
   * Execute the use case.
   *
   * @param status - Optional status filter ('pending' | 'completed').
   * @returns Array of task DTOs.
   */
  async execute(status?: TaskStatus): Promise<TaskResponseDto[]> {
    const tasks = await this.repo.findAll(status);
    return tasks.map(toTaskResponseDto);
  }
}
