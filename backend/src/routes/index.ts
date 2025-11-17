import { Router } from "express";
import authRoutes from "./auth.routes";
// (as demais rotas virão depois — turmas, aulas, presenças)

export const router = Router();
router.use("/auth", authRoutes);
