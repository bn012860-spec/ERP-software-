import express from "express";
import { sendSuccess } from "../packages/shared/src";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "ok", service: "auth-service" });
});

export default app;
