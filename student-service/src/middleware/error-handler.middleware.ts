import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "student-service",
      type: "unhandled_error",
      level: "error",
      requestId: req.headers["x-request-id"] ?? null,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message,
    }),
  );

  return res.status(statusCode).json({ error: message });
};
