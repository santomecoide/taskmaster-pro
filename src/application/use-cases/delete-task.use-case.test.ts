import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { DeleteTaskUseCase } from "./delete-task.use-case.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { createMockRepo, VALID_UUID } from "../../__tests__/helpers.js";

describe("DeleteTaskUseCase", () => {
  const repo = createMockRepo();
  const useCase = new DeleteTaskUseCase(repo);

  afterEach(() => { jest.clearAllMocks(); });

  it("should delete the task without throwing", async () => {
    repo.delete.mockResolvedValue(true);

    await expect(useCase.execute(VALID_UUID)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(VALID_UUID);
  });

  it("should throw NotFoundError when the task does not exist", async () => {
    repo.delete.mockResolvedValue(false);

    await expect(useCase.execute(VALID_UUID)).rejects.toThrow(NotFoundError);
  });
});
