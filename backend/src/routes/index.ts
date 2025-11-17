import { Router } from "express";
import authRoutes from "./auth.routes.js";
import turmaRoutes from "./turma.routes.js";

export const router = Router();
router.use("/auth", authRoutes);
router.use("/turmas", turmaRoutes);
