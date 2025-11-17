import { Router } from "express";
import authRoutes from "./auth.routes.js";
import turmaRoutes from "./turma.routes.js";
import alunoRoutes from "./aluno.routes.js";
import professorRoutes from "./professor.routes.js";
import aulaRoutes from "./aula.routes.js";

export const router = Router();
router.use("/auth", authRoutes);
router.use("/turmas", turmaRoutes);
router.use("/alunos", alunoRoutes);
router.use("/professores", professorRoutes);
router.use("/aulas", aulaRoutes);
