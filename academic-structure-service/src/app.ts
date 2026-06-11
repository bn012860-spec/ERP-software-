import express from "express";
import { sendError, sendSuccess, ErrorCode } from "../../packages/shared/src";
import prisma from "./config/prisma";
import structureRoutes from "./routes/structure.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/structure", structureRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, { status: "ok", service: "academic-structure-service", database: "connected" });
  } catch {
    return sendError(res, 503, "Academic structure database is disconnected", ErrorCode.SERVICE_UNAVAILABLE, { status: "degraded", service: "academic-structure-service", database: "disconnected" });
  }
});

export default app;
