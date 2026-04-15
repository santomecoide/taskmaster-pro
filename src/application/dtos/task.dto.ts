import type { Task } from "../../domain/entities/task.entity.js";
import type { TaskStatus } from "../../shared/constants.js";

/** Serializable representation of a Task sent to the client. */
export interface TaskResponseDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly creationDate: string;
}

/**
 * Map a domain Task entity to a response DTO.
 *
 * @param task - Domain entity.
 * @returns A plain object safe for JSON serialization.
 */
export function toTaskResponseDto(task: Task): TaskResponseDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    creationDate: task.creationDate.toISOString(),
  };
}
