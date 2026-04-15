import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { UpdateTaskUseCase } from "./update-task.use-case.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { createMockRepo, fakeTask, VALID_UUID } from "../../__tests__/helpers.js";

describe("UpdateTaskUseCase", () => {
  const repo = createMockRepo();
  const useCase = new UpdateTaskUseCase(repo);

  afterEach(() => jest.clearAllMocks());

  it("should update and return the task DTO", async () => {
    const existing = fakeTask();
    const updated = fakeTask({ title: "Updated title", status: "completed" });
    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute(VALID_UUID, {
      title: "Updated title",
      status: "completed",
    });

    expect(repo.findById).toHaveBeenCalledWith(VALID_UUID);
    expect(repo.update).toHaveBeenCalledWith(VALID_UUID, {
      title: "Updated title",
      status: "completed",
    });
    expect(result.title).toBe("Updated title");
    expect(result.status).toBe("completed");
  });

  it("should throw NotFoundError when the task does not exist", async () => {
    repo.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(VALID_UUID, { title: "Nope" }),
    ).rejects.toThrow(NotFoundError);

    expect(repo.update).not.toHaveBeenCalled();
  });
});
