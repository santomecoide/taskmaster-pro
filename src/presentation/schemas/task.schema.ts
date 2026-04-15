import { z } from "zod";
import { VALID_TASK_STATUSES, type TaskStatus } from "../../shared/constants.js";

const statusEnum = z.enum(
  VALID_TASK_STATUSES as unknown as [string, ...string[]],
) as z.ZodType<TaskStatus>;

/** Schema for POST /tasks */
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "title is required" })
      .trim()
      .min(1, "title must not be empty")
      .max(255, "title must be at most 255 characters"),
    description: z
      .string({ error: "description is required" })
      .trim()
      .min(1, "description must not be empty")
      .max(2000, "description must be at most 2000 characters"),
    status: statusEnum.optional(),
  }),
});

/** Schema for PATCH /tasks/:id */
export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("id must be a valid UUID"),
  }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "title must not be empty")
        .max(255, "title must be at most 255 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .min(1, "description must not be empty")
        .max(2000, "description must be at most 2000 characters")
        .optional(),
      status: statusEnum.optional(),
    })
    .refine(
      (data) => Object.values(data).some((v) => v !== undefined),
      { message: "At least one field (title, description, status) must be provided" },
    ),
});

/** Schema for GET /tasks/:id and DELETE /tasks/:id */
export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("id must be a valid UUID"),
  }),
});

/** Schema for GET /tasks?status=pending|completed */
export const getTasksQuerySchema = z.object({
  query: z.object({
    status: statusEnum.optional(),
  }),
});
