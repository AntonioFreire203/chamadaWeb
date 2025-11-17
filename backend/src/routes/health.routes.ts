// src/routes/health.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { logger } from "../utils/logger.js";
import type { Request, Response } from "express";

const router = Router();

// Health check básico
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Ready check (verifica DB)
router.get("/ready", async (_req: Request, res: Response) => {
  try {
    // Tenta fazer uma query simples no banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Database connection failed");
    
    res.status(503).json({
      status: "not_ready",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as healthRouter };
