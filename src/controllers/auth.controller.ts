import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ErrorCode, logError, logInfo, logWarn, sendError, sendSuccess } from "@erp/shared";
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

const getRequestId = (req: Request): string | null =>
  typeof req.headers["x-request-id"] === "string" ? req.headers["x-request-id"] : null;

const logAuthEvent = (req: Request, event: string, level: "info" | "warn" | "error", extra?: Record<string, unknown>): void => {
  const payload = {
    service: "auth-service",
    event,
    requestId: getRequestId(req),
    method: req.method,
    path: req.originalUrl,
    ...extra,
  };

  if (level === "error") {
    logError(payload);
    return;
  }

  if (level === "warn") {
    logWarn(payload);
    return;
  }

  logInfo(payload);
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, role } = req.body as RegisterBody;

    if (!email || !password || !role) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "missing_fields" });
      return sendError(res, 400, "Missing fields", ErrorCode.VALIDATION_FAILED);
    }

    if (!allowedRoles.includes(role)) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "invalid_role" });
      return sendError(res, 400, "Invalid role", ErrorCode.VALIDATION_FAILED);
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "invalid_email" });
      return sendError(res, 400, "Invalid email format", ErrorCode.VALIDATION_FAILED);
    }

    if (password.length < 6) {
      logAuthEvent(req, "register_validation_failed", "warn", { reason: "weak_password" });
      return sendError(res, 400, "Password must be at least 6 characters", ErrorCode.VALIDATION_FAILED);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      logAuthEvent(req, "register_conflict", "warn", { email: normalizedEmail });
      return sendError(res, 409, "Email already registered", ErrorCode.RESOURCE_ALREADY_EXISTS);
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

    return sendSuccess(res, createdUser, undefined, 201);
  } catch (err) {
    logAuthEvent(req, "register_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return sendError(res, 500, "Internal server error", ErrorCode.INTERNAL_ERROR);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      logAuthEvent(req, "login_validation_failed", "warn", { reason: "missing_fields" });
      return sendError(res, 400, "Missing fields", ErrorCode.VALIDATION_FAILED);
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      logAuthEvent(req, "login_validation_failed", "warn", { reason: "invalid_email" });
      return sendError(res, 400, "Invalid email format", ErrorCode.VALIDATION_FAILED);
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      logAuthEvent(req, "login_failed", "warn", { reason: "user_not_found", email: normalizedEmail });
      return sendError(res, 401, "Invalid credentials", ErrorCode.INVALID_CREDENTIALS);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      logAuthEvent(req, "login_failed", "warn", { reason: "password_mismatch", userId: user.id });
      return sendError(res, 401, "Invalid credentials", ErrorCode.INVALID_CREDENTIALS);
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      logAuthEvent(req, "login_error", "error", { reason: "missing_jwt_secret" });
      return sendError(res, 500, "JWT secret is not configured", ErrorCode.CONFIGURATION_ERROR);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
      expiresIn: "1h",
    });

    logAuthEvent(req, "login_success", "info", { userId: user.id, role: user.role });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (err) {
    logAuthEvent(req, "login_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return sendError(res, 500, "Internal server error", ErrorCode.INTERNAL_ERROR);
  }
};

export const whoami = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      logAuthEvent(req, "whoami_unauthorized", "warn");
      return sendError(res, 401, "Unauthorized", ErrorCode.UNAUTHORIZED);
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
      return sendError(res, 404, "User not found", ErrorCode.NOT_FOUND);
    }

    logAuthEvent(req, "whoami_success", "info", { userId: user.id, role: user.role });

    return sendSuccess(res, {
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    logAuthEvent(req, "whoami_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return sendError(res, 500, "Internal server error", ErrorCode.INTERNAL_ERROR);
  }
};
