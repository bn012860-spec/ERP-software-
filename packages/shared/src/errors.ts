import { ErrorCode } from "./error-codes";

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;

  constructor(statusCode: number, message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
