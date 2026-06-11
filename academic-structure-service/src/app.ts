import express from "express";
import prisma from "./config/prisma";
import structureRoutes from "./routes/structure.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/structure", structureRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "academic-structure-service", database: "connected" });
  } catch {
    res.status(503).json({ status: "degraded", service: "academic-structure-service", database: "disconnected" });
  }
});

export default app;
