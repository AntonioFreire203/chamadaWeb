import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { AppError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";
import type { Request, Response, NextFunction } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Logger com requestId
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers["x-request-id"] || randomUUID(),
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
  })
);

// Swagger UI (apenas em desenvolvimento)
if (env.NODE_ENV === "development") {
  try {
    const swaggerDocument = YAML.load(join(__dirname, "docs", "openapi.yaml"));
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "ChamadaWeb API Docs"
    }));
    logger.info("📚 Swagger UI disponível em /docs");
  } catch (error) {
    logger.warn({ err: error }, "Não foi possível carregar Swagger UI");
  }
}

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
  logger.error({ err }, "Erro não tratado");
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
  });
});

export default app;
