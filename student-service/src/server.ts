import dotenv from "dotenv";
import app from "./app";
import prisma from "./config/prisma";

dotenv.config();

const port = Number(process.env.STUDENT_SERVICE_PORT ?? 5001);

const server = app.listen(port, () => {
  console.log(`Student service running on http://localhost:${port}`);
});

const shutdown = (signal: string): void => {
  console.log(`[student-service] received ${signal}, shutting down gracefully`);
  server.close(() => {
    void prisma.$disconnect().finally(() => {
      console.log("[student-service] shutdown complete");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
