/**
 * Base application error.
 * All domain and application errors extend this class.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

/** Thrown when a requested resource does not exist. */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`);
  }
}

/** Thrown when input fails validation. */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
  }
}
