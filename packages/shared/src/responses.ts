import { Response } from "express";
import { ErrorCode } from "./error-codes";
import { ApiErrorResponse, ApiSuccessResponse } from "./types";

export const sendSuccess = <TData, TMeta = undefined>(
  res: Response,
  data: TData,
  meta?: TMeta,
  statusCode = 200,
): Response<ApiSuccessResponse<TData, TMeta>> => {
  const body: ApiSuccessResponse<TData, TMeta> = {
    success: true,
    data,
    ...(meta === undefined ? {} : { meta }),
  };

  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
  details?: unknown,
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details === undefined ? {} : { details }),
    },
  });
};
