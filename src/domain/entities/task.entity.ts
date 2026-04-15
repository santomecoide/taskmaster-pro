import { type TaskStatus, VALID_TASK_STATUSES } from "../../shared/constants.js";
import { ValidationError } from "../../shared/errors/app-error.js";

/** Properties required to construct a Task entity. */
export interface TaskProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly creationDate: Date;
}

/**
 * Domain entity representing a task.
 * Enforces business invariants upon construction.
 */
export class Task {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly creationDate: Date;

  private constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.creationDate = props.creationDate;
  }

  /**
   * Create a Task entity with full validation.
   *
   * @param props - Raw task properties.
   * @returns A valid Task instance.
   * @throws {ValidationError} When title is empty or status is invalid.
   */
  static create(props: TaskProps): Task {
    if (!props.title.trim()) {
      throw new ValidationError("Task title must not be empty");
    }

    if (!VALID_TASK_STATUSES.includes(props.status)) {
      throw new ValidationError(
        `Invalid status "${props.status}". Allowed: ${VALID_TASK_STATUSES.join(", ")}`,
      );
    }

    return new Task(props);
  }
}
