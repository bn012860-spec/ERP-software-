import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = Number(process.env.ACADEMIC_STRUCTURE_SERVICE_PORT ?? 5002);

const server = app.listen(port, () => {
  console.log(`Academic Structure service running on http://localhost:${port}`);
});

const shutdown = (signal: string): void => {
  console.log(`[academic-structure-service] received ${signal}, shutting down gracefully`);
  server.close(() => {
    console.log("[academic-structure-service] shutdown complete");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
