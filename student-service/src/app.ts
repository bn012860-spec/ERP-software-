import express from "express";
import { sendError, sendSuccess, ErrorCode } from "../../packages/shared/src";
import prisma from "./config/prisma";
import { errorHandler } from "./middleware/error-handler.middleware";
import studentRoutes from "./routes/student.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/students", studentRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, { status: "ok", service: "student-service", database: "connected" });
  } catch {
    return sendError(res, 503, "Student service database is disconnected", ErrorCode.SERVICE_UNAVAILABLE, { status: "degraded", service: "student-service", database: "disconnected" });
  }
});

app.use(errorHandler);

export default app;
