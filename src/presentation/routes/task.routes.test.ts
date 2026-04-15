import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import {
  buildTestApp,
  createMockRepo,
  fakeTask,
  VALID_UUID,
  ANOTHER_UUID,
  FIXED_DATE,
} from "../../__tests__/helpers.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

type MockedRepo = ReturnType<typeof createMockRepo>;

let repo: MockedRepo;
let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  repo = createMockRepo();
  app = buildTestApp(repo);
});

// ---------------------------------------------------------------------------
// POST /api/tasks
// ---------------------------------------------------------------------------
describe("POST /api/tasks", () => {
  const endpoint = "/api/tasks";

  it("should create a task and return 201", async () => {
    const task = fakeTask();
    repo.create.mockResolvedValue(task);

    const res = await request(app)
      .post(endpoint)
      .send({ title: "Test task", description: "A test task description" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toEqual({
      id: VALID_UUID,
      title: "Test task",
      description: "A test task description",
      status: "pending",
      creationDate: FIXED_DATE.toISOString(),
    });
    expect(repo.create).toHaveBeenCalledWith({
      title: "Test task",
      description: "A test task description",
    });
  });

  it("should accept an explicit status", async () => {
    const task = fakeTask({ status: "completed" });
    repo.create.mockResolvedValue(task);

    const res = await request(app)
      .post(endpoint)
      .send({ title: "Done", description: "Already done", status: "completed" });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("completed");
  });

  it("should return 400 when title is missing", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ description: "no title" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toMatch(/title/i);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("should return 400 when title is empty", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ title: "   ", description: "whitespace title" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title must not be empty/i);
  });

  it("should return 400 when description is missing", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ title: "Valid title" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/description/i);
  });

  it("should return 400 when status is invalid", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ title: "X", description: "Y", status: "archived" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/pending.*completed/i);
  });

  it("should return 400 when body is empty", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({});

    expect(res.status).toBe(400);
  });

  it("should return 400 for malformed JSON", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Content-Type", "application/json")
      .send("{bad json}");

    expect(res.status).toBe(400);
  });

  it("should return 400 when title exceeds 255 characters", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ title: "a".repeat(256), description: "desc" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/255/);
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks
// ---------------------------------------------------------------------------
describe("GET /api/tasks", () => {
  const endpoint = "/api/tasks";

  it("should return 200 with all tasks", async () => {
    const tasks = [
      fakeTask(),
      fakeTask({ id: ANOTHER_UUID, title: "Second", status: "completed" }),
    ];
    repo.findAll.mockResolvedValue(tasks);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledWith(undefined);
  });

  it("should return 200 with an empty array when no tasks exist", async () => {
    repo.findAll.mockResolvedValue([]);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should filter by status=pending", async () => {
    repo.findAll.mockResolvedValue([fakeTask()]);

    const res = await request(app).get(`${endpoint}?status=pending`);

    expect(res.status).toBe(200);
    expect(repo.findAll).toHaveBeenCalledWith("pending");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe("pending");
  });

  it("should filter by status=completed", async () => {
    repo.findAll.mockResolvedValue([fakeTask({ status: "completed" })]);

    const res = await request(app).get(`${endpoint}?status=completed`);

    expect(res.status).toBe(200);
    expect(repo.findAll).toHaveBeenCalledWith("completed");
    expect(res.body.data[0].status).toBe("completed");
  });

  it("should return 400 for an invalid status filter", async () => {
    const res = await request(app).get(`${endpoint}?status=invalid`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/pending.*completed/i);
    expect(repo.findAll).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks/:id
// ---------------------------------------------------------------------------
describe("GET /api/tasks/:id", () => {
  it("should return 200 with the task", async () => {
    repo.findById.mockResolvedValue(fakeTask());

    const res = await request(app).get(`/api/tasks/${VALID_UUID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(VALID_UUID);
    expect(repo.findById).toHaveBeenCalledWith(VALID_UUID);
  });

  it("should return 404 when the task does not exist", async () => {
    repo.findById.mockResolvedValue(undefined);

    const res = await request(app).get(`/api/tasks/${VALID_UUID}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should return 400 when the id is not a valid UUID", async () => {
    const res = await request(app).get("/api/tasks/not-a-uuid");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uuid/i);
    expect(repo.findById).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id
// ---------------------------------------------------------------------------
describe("PATCH /api/tasks/:id", () => {
  const url = `/api/tasks/${VALID_UUID}`;

  it("should update title and return 200", async () => {
    const existing = fakeTask();
    const updated = fakeTask({ title: "New title" });
    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch(url)
      .send({ title: "New title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("New title");
    expect(repo.update).toHaveBeenCalledWith(VALID_UUID, { title: "New title" });
  });

  it("should update status and return 200", async () => {
    const existing = fakeTask();
    const updated = fakeTask({ status: "completed" });
    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch(url)
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("completed");
  });

  it("should return 404 when the task does not exist", async () => {
    repo.findById.mockResolvedValue(undefined);

    const res = await request(app)
      .patch(url)
      .send({ title: "Nope" });

    expect(res.status).toBe(404);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("should return 400 when body is empty", async () => {
    const res = await request(app)
      .patch(url)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least one field/i);
  });

  it("should return 400 when status is invalid", async () => {
    const res = await request(app)
      .patch(url)
      .send({ status: "archived" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/pending.*completed/i);
  });

  it("should return 400 when id is not a valid UUID", async () => {
    const res = await request(app)
      .patch("/api/tasks/bad-id")
      .send({ title: "X" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uuid/i);
  });

  it("should return 400 when title is empty string", async () => {
    const res = await request(app)
      .patch(url)
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title must not be empty/i);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/tasks/:id
// ---------------------------------------------------------------------------
describe("DELETE /api/tasks/:id", () => {
  it("should delete the task and return 204", async () => {
    repo.delete.mockResolvedValue(true);

    const res = await request(app).delete(`/api/tasks/${VALID_UUID}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(repo.delete).toHaveBeenCalledWith(VALID_UUID);
  });

  it("should return 404 when the task does not exist", async () => {
    repo.delete.mockResolvedValue(false);

    const res = await request(app).delete(`/api/tasks/${VALID_UUID}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should return 400 when id is not a valid UUID", async () => {
    const res = await request(app).delete("/api/tasks/bad-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uuid/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
