import type { TaskRepository } from "../../domain/repositories/task.repository.js";
import type { TaskStatus } from "../../shared/constants.js";
import { type TaskResponseDto, toTaskResponseDto } from "../dtos/task.dto.js";

export interface CreateTaskCommand {
  readonly title: string;
  readonly description: string;
  readonly status?: TaskStatus;
}

/**
 * Persist a new task and return its serializable representation.
 */
export class CreateTaskUseCase {
  constructor(private readonly repo: TaskRepository) {}

  /**
   * Execute the use case.
   *
   * @param command - Validated creation payload.
   * @returns The newly created task DTO.
   */
  async execute(command: CreateTaskCommand): Promise<TaskResponseDto> {
    const task = await this.repo.create(command);
    return toTaskResponseDto(task);
  }
}
