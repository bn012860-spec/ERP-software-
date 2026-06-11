import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorCode, sendError } from "../../../packages/shared/src";
import { config } from "../config";

interface GatewayTokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export const gatewayAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, 401, "No token provided", ErrorCode.UNAUTHORIZED);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return sendError(res, 401, "Invalid authorization format", ErrorCode.UNAUTHORIZED);
    }

    if (!config.jwtSecret) {
      return sendError(res, 500, "Gateway JWT secret is not configured", ErrorCode.CONFIGURATION_ERROR);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as GatewayTokenPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "api-gateway",
        level: "error",
        type: "auth_error",
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        pathTemplate: "*",
        error: err instanceof Error ? err.message : "Unknown error",
      }),
    );
    return sendError(res, 401, "Invalid token", ErrorCode.UNAUTHORIZED);
  }
};
