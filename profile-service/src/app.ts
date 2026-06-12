import express from "express";
import { sendError, sendSuccess, ErrorCode } from "@erp/shared";
import prisma from "./config/prisma";
import profileRoutes from "./routes/profile.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/profiles", profileRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, { status: "ok", service: "profile-service", database: "connected" });
  } catch {
    return sendError(res, 503, "Profile service database is disconnected", ErrorCode.SERVICE_UNAVAILABLE, { status: "degraded", service: "profile-service", database: "disconnected" });
  }
});

export default app;
