/**
 * Allowed task status values.
 * Used as the single source of truth for status validation across all layers.
 */
export const TaskStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const VALID_TASK_STATUSES: readonly TaskStatus[] = Object.values(TaskStatus);
