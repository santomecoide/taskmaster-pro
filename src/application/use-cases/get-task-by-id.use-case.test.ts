import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { GetTaskByIdUseCase } from "./get-task-by-id.use-case.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { createMockRepo, fakeTask, VALID_UUID } from "../../__tests__/helpers.js";

describe("GetTaskByIdUseCase", () => {
  const repo = createMockRepo();
  const useCase = new GetTaskByIdUseCase(repo);

  afterEach(() => jest.clearAllMocks());

  it("should return a task DTO when the task exists", async () => {
    repo.findById.mockResolvedValue(fakeTask());

    const result = await useCase.execute(VALID_UUID);

    expect(repo.findById).toHaveBeenCalledWith(VALID_UUID);
    expect(result.id).toBe(VALID_UUID);
    expect(result.title).toBe("Test task");
  });

  it("should throw NotFoundError when the task does not exist", async () => {
    repo.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(VALID_UUID)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(VALID_UUID)).rejects.toThrow(
      `Task with id "${VALID_UUID}" not found`,
    );
  });
});
