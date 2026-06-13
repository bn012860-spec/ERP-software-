import dotenv from "dotenv";
import app from "./app";
import prisma from "./config/prisma";

dotenv.config();

const port = Number(process.env.ATTENDANCE_SERVICE_PORT ?? 5005);

const server = app.listen(port, () => {
  console.log(`Attendance service running on http://localhost:${port}`);
});

const shutdown = (signal: string): void => {
  console.log(`[attendance-service] received ${signal}, shutting down gracefully`);
  server.close(() => {
    void prisma.$disconnect().finally(() => {
      console.log("[attendance-service] shutdown complete");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
