import express from "express";
import prisma from "./config/prisma";
import profileRoutes from "./routes/profile.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/profiles", profileRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "profile-service", database: "connected" });
  } catch {
    res.status(503).json({ status: "degraded", service: "profile-service", database: "disconnected" });
  }
});

export default app;
