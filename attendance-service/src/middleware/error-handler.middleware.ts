import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode, sendError } from "../../../packages/shared/src";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  const code = err instanceof AppError ? err.code : ErrorCode.INTERNAL_ERROR;

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "attendance-service",
      type: "unhandled_error",
      level: "error",
      requestId: req.headers["x-request-id"] ?? null,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code,
      message,
    }),
  );

  return sendError(res, statusCode, message, code);
};
