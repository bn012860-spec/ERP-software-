import dotenv from "dotenv";
import app from "./app";
import { config } from "./config";

dotenv.config();

const server = app.listen(config.port, () => {
  console.log(`API Gateway running on http://localhost:${config.port}`);
});

const shutdown = (signal: string): void => {
  console.log(`[api-gateway] received ${signal}, shutting down gracefully`);
  server.close(() => {
    console.log("[api-gateway] shutdown complete");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
