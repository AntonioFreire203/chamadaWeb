import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { registerDTO, loginDTO } from "../dtos/auth.dto.js";

const router = Router();

/**
 * POST /auth/register
 * Registra um novo usuário
 */
router.post("/register", validate(registerDTO), AuthController.register);

/**
 * POST /auth/login
 * Realiza login e retorna token JWT
 */
router.post("/login", validate(loginDTO), AuthController.login);

/**
 * GET /auth/me
 * Retorna dados do usuário logado (requer autenticação)
 */
router.get("/me", auth, AuthController.me);

export default router;
