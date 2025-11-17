import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";

export const AuthController = {
  /**
   * POST /auth/register
   * Registra um novo usuário
   */
  register: (req: Request, res: Response, next: NextFunction) =>
    AuthService.register(req.body)
      .then((out) => res.status(201).json(out))
      .catch(next),

  /**
   * POST /auth/login
   * Realiza login e retorna token JWT
   */
  login: (req: Request, res: Response, next: NextFunction) =>
    AuthService.login(req.body)
      .then((out) => res.json(out))
      .catch(next),

  /**
   * GET /auth/me
   * Retorna dados do usuário logado (requer autenticação)
   */
  me: (req: Request, res: Response, next: NextFunction) =>
    AuthService.me(req.user!.sub)
      .then((out) => res.json(out))
      .catch(next),
};
