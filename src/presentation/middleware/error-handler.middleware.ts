import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/app-error.js";

interface ErrorResponseBody {
  readonly status: "error";
  readonly statusCode: number;
  readonly message: string;
}

/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and middleware,
 * maps them to a consistent JSON response structure.
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ErrorResponseBody = {
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    const body: ErrorResponseBody = {
      status: "error",
      statusCode: 400,
      message: "Malformed JSON in request body",
    };
    res.status(400).json(body);
    return;
  }

  console.error("Unhandled error:", err);

  const body: ErrorResponseBody = {
    status: "error",
    statusCode: 500,
    message: "Internal server error",
  };
  res.status(500).json(body);
}
