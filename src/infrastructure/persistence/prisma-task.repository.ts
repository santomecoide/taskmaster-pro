import type { PrismaClient } from "@prisma/client";
import { Task } from "../../domain/entities/task.entity.js";
import type {
  CreateTaskInput,
  TaskRepository,
} from "../../domain/repositories/task.repository.js";
import type { TaskStatus } from "../../shared/constants.js";

/**
 * Prisma-backed implementation of the TaskRepository port.
 * Maps between Prisma records and domain Task entities.
 */
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async create(input: CreateTaskInput): Promise<Task> {
    const record = await this.prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status ?? "pending",
      },
    });

    return this.toDomain(record);
  }

  /** @inheritdoc */
  async findById(id: string): Promise<Task | undefined> {
    const record = await this.prisma.task.findUnique({ where: { id } });
    return record ? this.toDomain(record) : undefined;
  }

  /** @inheritdoc */
  async findAll(status?: TaskStatus): Promise<Task[]> {
    const records = await this.prisma.task.findMany({
      where: status ? { status } : undefined,
      orderBy: { creation_date: "desc" },
    });

    return records.map((r) => this.toDomain(r));
  }

  /** @inheritdoc */
  async update(
    id: string,
    data: Partial<Pick<Task, "title" | "description" | "status">>,
  ): Promise<Task> {
    const record = await this.prisma.task.update({
      where: { id },
      data,
    });

    return this.toDomain(record);
  }

  /** @inheritdoc */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Map a Prisma task record to a domain Task entity.
   *
   * @param record - Raw database record from Prisma.
   * @returns A validated Task domain entity.
   */
  private toDomain(record: {
    id: string;
    title: string;
    description: string;
    status: string;
    creation_date: Date;
  }): Task {
    return Task.create({
      id: record.id,
      title: record.title,
      description: record.description,
      status: record.status as TaskStatus,
      creationDate: record.creation_date,
    });
  }
}
