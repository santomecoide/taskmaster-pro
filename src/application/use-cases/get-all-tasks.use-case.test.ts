import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { GetAllTasksUseCase } from "./get-all-tasks.use-case.js";
import { createMockRepo, fakeTask, ANOTHER_UUID } from "../../__tests__/helpers.js";

describe("GetAllTasksUseCase", () => {
  const repo = createMockRepo();
  const useCase = new GetAllTasksUseCase(repo);

  afterEach(() => { jest.clearAllMocks(); });

  it("should return all tasks as DTOs when no filter is given", async () => {
    const tasks = [
      fakeTask(),
      fakeTask({ id: ANOTHER_UUID, title: "Second task", status: "completed" }),
    ];
    repo.findAll.mockResolvedValue(tasks);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledWith(undefined);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Test task");
    expect(result[1].status).toBe("completed");
  });

  it("should pass 'pending' status filter to the repository", async () => {
    repo.findAll.mockResolvedValue([fakeTask()]);

    const result = await useCase.execute("pending");

    expect(repo.findAll).toHaveBeenCalledWith("pending");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("pending");
  });

  it("should pass 'completed' status filter to the repository", async () => {
    repo.findAll.mockResolvedValue([
      fakeTask({ status: "completed" }),
    ]);

    const result = await useCase.execute("completed");

    expect(repo.findAll).toHaveBeenCalledWith("completed");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("completed");
  });

  it("should return an empty array when no tasks exist", async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
