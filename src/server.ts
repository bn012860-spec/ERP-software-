import dotenv from "dotenv";
import app from "./app";
import prisma from "./config/prisma";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

const server = app.listen(port, () => {
  console.log(`Auth service running on http://localhost:${port}`);
});

const shutdown = (signal: string): void => {
  console.log(`[auth-service] received ${signal}, shutting down gracefully`);
  server.close(() => {
    void prisma.$disconnect().finally(() => {
      console.log("[auth-service] shutdown complete");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
