# TaskMaster Pro

A task management REST API built with **Node.js**, **TypeScript**, **Express 5**, and **Prisma ORM** on **SQLite**. The project follows **Clean Architecture** principles with strict layer separation, strong typing, Zod-based request validation, and a global error handling mechanism.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [AI Prompts Used During Development](#ai-prompts-used-during-development)

---

## Prerequisites

| Tool    | Version   |
|---------|-----------|
| Node.js | >= 20 LTS |
| npm     | >= 10     |

No external database server is required — SQLite runs as an embedded file.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd taskmaster-pro

# Install dependencies
npm install
```

## Database Setup

### 1. Create the environment file

```bash
cp .env.example .env
```

Or create `.env` manually at the project root:

```
DATABASE_URL="file:./dev.db"
```

### 2. Generate the Prisma client

```bash
npm run db:generate
```

### 3. Run the database migration

```bash
npm run db:migrate
```

This creates the SQLite database file (`dev.db`) and applies the `tasks` table schema:

```sql
CREATE TABLE "tasks" (
    "id"            TEXT     NOT NULL PRIMARY KEY,   -- UUID
    "title"         TEXT     NOT NULL,
    "description"   TEXT     NOT NULL,
    "status"        TEXT     NOT NULL DEFAULT 'pending',
    "creation_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Seed the database (optional)

```bash
npm run db:seed
```

Inserts four sample tasks for immediate exploration.

### 5. Browse data visually (optional)

```bash
npm run db:studio
```

Opens Prisma Studio in your browser on `http://localhost:5555`.

## Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production mode (single run)
npm start
```

The server starts on `http://localhost:3000` by default. Override with the `PORT` environment variable:

```bash
PORT=4000 npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api/tasks`

### Create a task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**Response** `201 Created`:

```json
{
  "status": "success",
  "data": {
    "id": "a3cd433b-1baa-4ad4-84fc-91fb6b814e39",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "creationDate": "2026-04-15T04:07:55.730Z"
  }
}
```

### List all tasks

```bash
curl http://localhost:3000/api/tasks
```

### Filter tasks by status

```bash
curl "http://localhost:3000/api/tasks?status=pending"
curl "http://localhost:3000/api/tasks?status=completed"
```

### Get a task by ID

```bash
curl http://localhost:3000/api/tasks/<uuid>
```

### Update a task

```bash
curl -X PATCH http://localhost:3000/api/tasks/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/api/tasks/<uuid>
# Returns 204 No Content on success
```

### Error responses

All errors follow a consistent structure:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "title: title must not be empty"
}
```

| Status Code | Meaning                                      |
|-------------|----------------------------------------------|
| `400`       | Validation error (bad input, invalid status)  |
| `404`       | Task not found                                |
| `500`       | Internal server error                         |

### Request Validation Rules

| Field         | Create (POST)           | Update (PATCH)                 |
|---------------|-------------------------|--------------------------------|
| `title`       | Required, 1–255 chars   | Optional, 1–255 chars          |
| `description` | Required, 1–2000 chars  | Optional, 1–2000 chars         |
| `status`      | Optional: `pending` or `completed` | Optional: `pending` or `completed` |
| `:id` param   | —                       | Must be a valid UUID           |
| Body (PATCH)  | —                       | At least one field required    |

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch
```

The test suite includes **39 tests** across **6 test suites**:

- **5 use case unit test files** — each use case tested in isolation with a mocked `TaskRepository`
- **1 API integration test file** — full HTTP pipeline tested via `supertest` (routes, Zod validation, controllers, error handler) with the database mocked out

### Test coverage summary

| Area                  | Tests | What is verified                                              |
|-----------------------|-------|---------------------------------------------------------------|
| `CreateTaskUseCase`   | 2     | Creates task via repo, forwards optional status               |
| `GetAllTasksUseCase`  | 4     | Returns all, filters by pending/completed, handles empty list |
| `GetTaskByIdUseCase`  | 2     | Returns DTO when found, throws `NotFoundError` when missing   |
| `UpdateTaskUseCase`   | 2     | Updates + returns DTO, throws `NotFoundError` when missing    |
| `DeleteTaskUseCase`   | 2     | Deletes successfully, throws `NotFoundError` on false         |
| API integration       | 27    | All CRUD endpoints, all validation rules, status filtering, error responses |

## Project Structure

```
taskmaster-pro/
├── prisma/
│   ├── schema.prisma                        # Data model definition
│   ├── seed.ts                              # Database seeder
│   └── migrations/                          # Auto-generated migration SQL
├── src/
│   ├── domain/                              # Enterprise business rules
│   │   ├── entities/
│   │   │   └── task.entity.ts               # Task entity with validation
│   │   └── repositories/
│   │       └── task.repository.ts           # TaskRepository interface (port)
│   ├── application/                         # Application business rules
│   │   ├── dtos/
│   │   │   └── task.dto.ts                  # Response DTO + mapper
│   │   └── use-cases/
│   │       ├── create-task.use-case.ts
│   │       ├── get-all-tasks.use-case.ts    # Supports status filtering
│   │       ├── get-task-by-id.use-case.ts
│   │       ├── update-task.use-case.ts
│   │       └── delete-task.use-case.ts
│   ├── infrastructure/                      # Frameworks & drivers
│   │   └── persistence/
│   │       ├── prisma.client.ts             # Singleton PrismaClient
│   │       └── prisma-task.repository.ts    # TaskRepository implementation
│   ├── presentation/                        # Interface adapters
│   │   ├── controllers/
│   │   │   └── task.controller.ts           # HTTP controller
│   │   ├── middleware/
│   │   │   ├── validate.middleware.ts       # Zod validation middleware
│   │   │   └── error-handler.middleware.ts  # Global error handler
│   │   ├── routes/
│   │   │   └── task.routes.ts               # Express router
│   │   └── schemas/
│   │       └── task.schema.ts               # Zod request schemas
│   ├── shared/                              # Cross-cutting concerns
│   │   ├── constants.ts                     # TaskStatus enum
│   │   └── errors/
│   │       └── app-error.ts                 # AppError hierarchy
│   └── main.ts                              # Composition root & server bootstrap
├── prisma.config.ts                         # Prisma v7 CLI configuration
├── tsconfig.json                            # TypeScript config
├── tsconfig.test.json                       # TypeScript config for tests
├── jest.config.mjs                          # Jest ESM configuration
├── package.json
└── .env                                     # Environment variables (not committed)
```

## Architecture Overview

The project follows **Clean Architecture** with four distinct layers:

```
┌──────────────────────────────────────────┐
│            Presentation Layer            │
│  Controllers · Routes · Middleware · Zod │
├──────────────────────────────────────────┤
│            Application Layer             │
│    Use Cases · DTOs · Input/Output       │
├──────────────────────────────────────────┤
│              Domain Layer                │
│   Entities · Repository Interfaces       │
├──────────────────────────────────────────┤
│          Infrastructure Layer            │
│   Prisma Client · Repository Impls       │
└──────────────────────────────────────────┘
```

**Dependency rule**: dependencies point inward only. The domain layer has zero external dependencies. The application layer depends only on domain interfaces. Infrastructure implements those interfaces. The presentation layer orchestrates everything through use cases.

## Tech Stack

| Category        | Technology                                      |
|-----------------|--------------------------------------------------|
| Runtime         | Node.js 22 LTS                                   |
| Language        | TypeScript 6 (strict mode)                       |
| Web Framework   | Express 5                                        |
| ORM             | Prisma 7 + better-sqlite3 driver adapter         |
| Database        | SQLite                                           |
| Validation      | Zod 4                                            |
| Testing         | Jest 30 + ts-jest (ESM) + supertest              |
| Module System   | ESM (`"type": "module"`)                         |

## Environment Variables

| Variable       | Description                          | Default          |
|----------------|--------------------------------------|------------------|
| `DATABASE_URL` | SQLite connection string             | `file:./dev.db`  |
| `PORT`         | HTTP server port                     | `3000`           |

## npm Scripts Reference

| Script            | Description                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start with file watching (hot reload)        |
| `npm start`       | Start the server                             |
| `npm test`        | Run all tests                                |
| `npm run test:watch` | Run tests in watch mode                   |
| `npm run build`   | Compile TypeScript to `dist/`                |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate`  | Create and apply a new migration          |
| `npm run db:seed`     | Seed the database with sample tasks       |
| `npm run db:studio`   | Open Prisma Studio GUI                   |

---

## AI Prompts Used During Development

This project was built iteratively through a series of AI prompts. Below is the exact sequence of prompts used, along with what each one produced.

### Prompt 1 — Project Rules & Coding Standards

> **"Act as an expert Node.js and TypeScript developer. Generate the .cursorrules file for this project: use Clean Architecture, strong typing, and professional documentation standards."**

Created six `.cursor/rules/*.mdc` rule files establishing project-wide conventions: TypeScript strict mode, Clean Architecture layer structure with dependency rules, JSDoc documentation standards, error handling patterns (`AppError` hierarchy + `Result<T, E>`), testing conventions (Arrange-Act-Assert, co-located test files), and general project standards (ESM, Conventional Commits, no `any`, structured logging).

### Prompt 2 — Data Model & Prisma Schema

> **"Create a data model in SQLite using Prisma ORM for a task app. The model must have these fields: id (UUID or Int), title (String), description (String), status (String with default 'pending', allowing only 'pending' or 'completed'), and creation_date (DateTime defaulting to now). Generate the schema.prisma and the necessary initialization code."**

Scaffolded the entire project foundation: `package.json` (ESM), `tsconfig.json`, Prisma schema with the `Task` model, `prisma.config.ts` (Prisma v7 format), the domain entity with factory validation, the `TaskRepository` interface (port), the Prisma-backed repository implementation (adapter), the singleton `PrismaClient` with better-sqlite3 driver, custom error hierarchy (`AppError`, `NotFoundError`, `ValidationError`), `TaskStatus` constants, the database seed script, and the initial migration.

### Prompt 3 — REST API Endpoints

> **"Generate the API endpoints to manage tasks (Create, Read all, Read by ID, Update, Delete) using the existing data model. Crucial requirements: Include strict data validation for incoming requests and implement a global error handling mechanism. Also, create a specific function/endpoint to filter tasks by their status."**

Built the full application and presentation layers: five single-responsibility use cases (`CreateTask`, `GetAllTasks`, `GetTaskById`, `UpdateTask`, `DeleteTask`), a `TaskResponseDto` mapper, four Zod validation schemas (create, update, id param, query filter), a reusable `validate()` middleware, a global error handler middleware (maps `AppError` subclasses to structured JSON responses, catches malformed JSON, returns 500 for unexpected errors), an Express controller, route wiring, and the composition root in `main.ts`. All 19 endpoint behaviors were verified with curl.

### Prompt 4 — Unit Tests

> **"Generate unit tests for the task API endpoints using Jest. Mock the database calls and include tests for successful CRUD operations, data validation errors, and the status filtering function."**

Set up the full testing infrastructure: Jest 30 with `ts-jest` ESM preset, a dedicated `tsconfig.test.json`, and a test helper module providing `createMockRepo()`, `fakeTask()`, and `buildTestApp()` factories. Created five co-located use case unit test files (12 tests) and one API integration test file using supertest (27 tests) covering every endpoint, all validation rules, status filtering, and error responses. Total: 39 tests, all passing.

### Prompt 5 — Documentation

> **"Generate a comprehensive README.md file for this project. It must include clear instructions on how to install dependencies, set up the SQLite database, run the app, and execute the tests. Also, create a section at the bottom documenting the main AI prompts used during development."**

Produced this README.
