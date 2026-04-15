import type { Request, Response, NextFunction } from "express";
import { type AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../../shared/errors/app-error.js";

/**
 * Return Express middleware that validates req against the given Zod schema.
 * On failure, throws a ValidationError with all field-level details.
 *
 * @param schema - Zod object schema with optional body/params/query keys.
 * @returns Express middleware function.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) {
        req.body = parsed.body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues
          .map((issue) => `${issue.path.slice(1).join(".")}: ${issue.message}`)
          .join("; ");
        next(new ValidationError(details));
        return;
      }
      next(error);
    }
  };
}
