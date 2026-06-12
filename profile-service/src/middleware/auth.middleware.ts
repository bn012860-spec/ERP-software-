import { NextFunction, Request, Response } from "express";
import { ErrorCode, sendError } from "@erp/shared";
import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return sendError(res, 401, "No token provided", ErrorCode.UNAUTHORIZED);

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) return sendError(res, 401, "Invalid authorization format", ErrorCode.UNAUTHORIZED);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return sendError(res, 500, "JWT secret is not configured", ErrorCode.CONFIGURATION_ERROR);

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    return sendError(res, 401, "Invalid token", ErrorCode.UNAUTHORIZED);
  }
};
