import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { sendError } from "./responses";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return sendError(res, 400, "Validation failed", "VALIDATION_ERROR", result.error.issues);
    }

    req.body = result.data;
    next();
  };
};
