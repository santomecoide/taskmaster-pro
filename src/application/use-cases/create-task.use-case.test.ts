import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { CreateTaskUseCase } from "./create-task.use-case.js";
import { createMockRepo, fakeTask, VALID_UUID, FIXED_DATE } from "../../__tests__/helpers.js";

describe("CreateTaskUseCase", () => {
  const repo = createMockRepo();
  const useCase = new CreateTaskUseCase(repo);

  afterEach(() => jest.clearAllMocks());

  it("should create a task and return a DTO", async () => {
    const task = fakeTask();
    repo.create.mockResolvedValue(task);

    const result = await useCase.execute({
      title: "Test task",
      description: "A test task description",
    });

    expect(repo.create).toHaveBeenCalledWith({
      title: "Test task",
      description: "A test task description",
    });
    expect(result).toEqual({
      id: VALID_UUID,
      title: "Test task",
      description: "A test task description",
      status: "pending",
      creationDate: FIXED_DATE.toISOString(),
    });
  });

  it("should forward the optional status to the repository", async () => {
    const task = fakeTask({ status: "completed" });
    repo.create.mockResolvedValue(task);

    await useCase.execute({
      title: "Done task",
      description: "Already completed",
      status: "completed",
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" }),
    );
  });
});
