import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const allowedRoles = ["ADMIN", "TEACHER", "STUDENT"] as const;
type Role = (typeof allowedRoles)[number];

interface RegisterBody {
  email?: string;
  password?: string;
  role?: Role;
}

interface LoginBody {
  email?: string;
  password?: string;
}

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const logAuthEvent = (req: Request, event: string, level: "info" | "warn" | "error", extra?: Record<string, unknown>): void => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "auth-service",
      event,
      level,
      requestId: req.headers["x-request-id"] ?? null,
      method: req.method,
      path: req.originalUrl,
      ...extra,
    }),
  );
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, role } = req.body as RegisterBody;

    if (!email || !password || !role) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "missing_fields" });
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!allowedRoles.includes(role)) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "invalid_role" });
      return res.status(400).json({ error: "Invalid role" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "invalid_email" });
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "weak_password" });
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      logAuthEvent(req, "register_conflict", "warn", { email: normalizedEmail });
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    logAuthEvent(req, "register_success", "info", { userId: createdUser.id, role: createdUser.role });

    return res.status(201).json(createdUser);
  } catch (err) {
    logAuthEvent(req, "register_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      logAuthEvent(req, "login_validation_failed", "warn", { reason: "missing_fields" });
      return res.status(400).json({ error: "Missing fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      logAuthEvent(req, "login_validation_failed", "warn", { reason: "invalid_email" });
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      logAuthEvent(req, "login_failed", "warn", { reason: "user_not_found", email: normalizedEmail });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      logAuthEvent(req, "login_failed", "warn", { reason: "password_mismatch", userId: user.id });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      logAuthEvent(req, "login_error", "error", { reason: "missing_jwt_secret" });
      return res.status(500).json({ error: "JWT secret is not configured" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
      expiresIn: "1h",
    });

    logAuthEvent(req, "login_success", "info", { userId: user.id, role: user.role });

    return res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (err) {
    logAuthEvent(req, "login_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const whoami = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      logAuthEvent(req, "whoami_unauthorized", "warn");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      logAuthEvent(req, "whoami_not_found", "warn", { userId: req.user.userId });
      return res.status(404).json({ error: "User not found" });
    }

    logAuthEvent(req, "whoami_success", "info", { userId: user.id, role: user.role });

    return res.json({
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    logAuthEvent(req, "whoami_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};
