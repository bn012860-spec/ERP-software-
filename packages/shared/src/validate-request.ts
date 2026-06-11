import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ErrorCode } from "./error-codes";
import { sendError } from "./responses";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return sendError(res, 400, "Validation failed", ErrorCode.VALIDATION_FAILED, result.error.issues);
    }

    req.body = result.data;
    next();
  };
};
