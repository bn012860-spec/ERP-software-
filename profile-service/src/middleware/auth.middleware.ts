import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "Invalid authorization format" });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: "JWT secret is not configured" });

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
