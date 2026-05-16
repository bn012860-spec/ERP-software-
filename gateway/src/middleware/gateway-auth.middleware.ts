import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
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
      return res.status(401).json({ error: "No token provided" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    if (!config.jwtSecret) {
      return res.status(500).json({ error: "Gateway JWT secret is not configured" });
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
    return res.status(401).json({ error: "Invalid token" });
  }
};
