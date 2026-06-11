import express from "express";
import prisma from "./config/prisma";
import { errorHandler } from "./middleware/error-handler.middleware";
import studentRoutes from "./routes/student.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/students", studentRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "student-service", database: "connected" });
  } catch {
    res.status(503).json({ status: "degraded", service: "student-service", database: "disconnected" });
  }
});

app.use(errorHandler);

export default app;
