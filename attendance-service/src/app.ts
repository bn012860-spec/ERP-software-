import express from "express";
import { ErrorCode, sendError, sendSuccess } from "../../packages/shared/src";
import prisma from "./config/prisma";
import attendanceRoutes from "./routes/attendance.routes";
import { errorHandler } from "./middleware/error-handler.middleware";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/attendance", attendanceRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, { status: "ok", service: "attendance-service", database: "connected" });
  } catch {
    return sendError(res, 503, "Attendance service database is disconnected", ErrorCode.SERVICE_UNAVAILABLE, { status: "degraded", service: "attendance-service", database: "disconnected" });
  }
});

app.use(errorHandler);

export default app;
