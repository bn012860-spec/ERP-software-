import crypto from "node:crypto";
import express from "express";
import { ErrorCode, sendError, sendSuccess } from "../../packages/shared/src";
import { config } from "./config";
import { gatewayAuthenticate } from "./middleware/gateway-auth.middleware";
import { forwardRequest, normalizeGatewayError } from "./proxy";

const app = express();

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const requestStore = new Map<string, { count: number; windowStart: number }>();

type LogLevel = "info" | "warn" | "error";

interface LogEvent {
  level: LogLevel;
  type: string;
  requestId?: string;
  method?: string;
  path?: string;
  pathTemplate?: string;
  service: string;
  status?: number;
  statusGroup?: "2xx" | "3xx" | "4xx" | "5xx";
  duration?: number;
  ip?: string;
  targetUrl?: string;
  error?: string;
}

const getStatusGroup = (status: number): "2xx" | "3xx" | "4xx" | "5xx" => {
  if (status >= 500) return "5xx";
  if (status >= 400) return "4xx";
  if (status >= 300) return "3xx";
  return "2xx";
};

const logEvent = (event: LogEvent): void => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event,
    }),
  );
};

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  next();
});

app.use((req, _res, next) => {
  logEvent({
    level: "info",
    type: "incoming_request",
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    service: "api-gateway",
    ip: req.ip || req.socket.remoteAddress || "unknown",
  });
  next();
});

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = requestStore.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    requestStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    const status = 429;
    logEvent({
      level: "warn",
      type: "rate_limit_exceeded",
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      pathTemplate: "*",
      ip,
      status,
      statusGroup: getStatusGroup(status),
      service: "api-gateway",
    });
    return sendError(res, status, "Too many requests", ErrorCode.FORBIDDEN);
  }

  return next();
});

const proxyToService = (
  serviceName: string,
  targetUrl: string,
  prefix: string,
  pathTemplate: string,
) => {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const start = Date.now();

    try {
      logEvent({
        level: "info",
        type: "proxy_forward",
        requestId: req.requestId,
        service: "api-gateway",
        method: req.method,
        path: req.originalUrl,
        pathTemplate,
        targetUrl,
      });

      await forwardRequest(req, res, targetUrl, prefix);
      const status = res.statusCode;

      logEvent({
        level: "info",
        type: "proxy_response",
        requestId: req.requestId,
        service: "api-gateway",
        method: req.method,
        path: req.originalUrl,
        pathTemplate,
        status,
        statusGroup: getStatusGroup(status),
        duration: Date.now() - start,
        targetUrl: serviceName,
      });
    } catch (err) {
      const normalized = normalizeGatewayError(err, res);
      const status = normalized.statusCode;

      logEvent({
        level: "error",
        type: "proxy_error",
        requestId: req.requestId,
        service: "api-gateway",
        method: req.method,
        path: req.originalUrl,
        pathTemplate,
        status,
        statusGroup: getStatusGroup(status),
        duration: Date.now() - start,
        targetUrl: serviceName,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };
};

app.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "ok", service: "api-gateway" });
});

app.use(
  "/api/auth",
  proxyToService("auth-service", config.services.auth, "/api", "/api/auth/*"),
);
app.use(
  "/api/students",
  gatewayAuthenticate,
  proxyToService("student-service", config.services.students, "/api", "/api/students/*"),
);
app.use(
  "/api/academic",
  gatewayAuthenticate,
  proxyToService("academic-service", config.services.academic, "/api/academic", "/api/academic/*"),
);
app.use(
  "/api/structure",
  gatewayAuthenticate,
  proxyToService("academic-structure-service", config.services.academic, "/api", "/api/structure/*"),
);
app.use(
  "/api/profiles",
  gatewayAuthenticate,
  proxyToService("profile-service", config.services.profiles, "/api", "/api/profiles/*"),
);
app.use(
  "/api/billing",
  gatewayAuthenticate,
  proxyToService("billing-service", config.services.billing, "/api", "/api/billing/*"),
);

export default app;
