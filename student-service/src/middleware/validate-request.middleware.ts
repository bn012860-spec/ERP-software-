import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          service: "student-service",
          type: "validation_failed",
          level: "warn",
          requestId: req.headers["x-request-id"] ?? null,
          method: req.method,
          path: req.originalUrl,
          issues: result.error.issues,
        }),
      );
      return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
    }

    req.body = result.data;
    next();
  };
};
