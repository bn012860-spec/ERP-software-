import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode, logError, sendError } from "@erp/shared";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  const code = err instanceof AppError ? err.code : ErrorCode.INTERNAL_ERROR;

  logError({
    service: "attendance-service",
    type: "unhandled_error",
    requestId: typeof req.headers["x-request-id"] === "string" ? req.headers["x-request-id"] : null,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    message,
  });

  return sendError(res, statusCode, message, code);
};
