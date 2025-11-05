import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: AnyZodObject, source: "body"|"params"|"query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    (req as any)[source] = schema.parse((req as any)[source]);
    next();
  };