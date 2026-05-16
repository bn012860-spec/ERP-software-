import express from "express";
import studentRoutes from "./routes/student.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/students", studentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "student-service" });
});

export default app;
