import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { AppError } from "./utils/errors.js";
import type { Request, Response, NextFunction } from "express";

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Rotas da API
app.use(env.API_PREFIX, router);

// Error handler global
app.use((err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  // Erro desconhecido
  console.error("Erro não tratado:", err);
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
  });
});

export default app;
