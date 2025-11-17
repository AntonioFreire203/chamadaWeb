import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Middleware para validar request com Zod schema
 */
export const validate =
  (schema: ZodSchema, source: "body" | "params" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      (req as any)[source] = schema.parse((req as any)[source]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return next(new ValidationError(messages));
      }
      next(error);
    }
  };