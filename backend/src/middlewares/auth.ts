import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export type JwtUser = {
  sub: string; // id do usuario
  role: "ADMIN" | "PROFESSOR" | "COORDENADOR" | "ALUNO";
  id_professor?: string | null;
  id_aluno?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Verifica o token no header Authorization: Bearer <token>
 */
export function auth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token não fornecido"));
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(new UnauthorizedError("Token não fornecido"));
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET || "secret") as JwtUser;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Token inválido ou expirado"));
  }
}