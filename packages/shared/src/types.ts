import { Request } from "express";

export interface AuthUser {
  userId: string;
  role: string;
}

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<TData, TMeta = undefined> {
  success: true;
  data: TData;
  meta?: TMeta;
}

export interface ApiErrorBody {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}
