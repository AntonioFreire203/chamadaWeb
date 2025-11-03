import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/health", (_req, res) => {
  res.json({ name: env.NAME, status: "ok", time: new Date().toISOString() });
});

export default app;
