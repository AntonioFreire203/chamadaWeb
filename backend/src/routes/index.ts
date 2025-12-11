import { Router } from "express";
import authRoutes from "./auth.routes.js";
import turmaRoutes from "./turma.routes.js";
import alunoRoutes from "./aluno.routes.js";
import professorRoutes from "./professor.routes.js";
import aulaRoutes from "./aula.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import { healthRouter } from "./health.routes.js";

export const router = Router();

// Health endpoints (sem API_PREFIX)
router.use("/", healthRouter);

// API routes
router.use("/auth", authRoutes);
router.use("/turmas", turmaRoutes);
router.use("/alunos", alunoRoutes);
router.use("/professores", professorRoutes);
router.use("/aulas", aulaRoutes);
router.use("/usuarios", usuarioRoutes);
