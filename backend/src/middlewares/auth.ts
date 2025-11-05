import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtUser = {
  sub: string; // id do usuario
  role: "ADMIN" | "PROFESSOR" | "GESTOR" | "ALUNO";
  id_professor?: string | null;
  id_aluno?: string | null;
};

declare global {
  namespace Express {
    interface Request { user?: JwtUser }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return next({ status: 401, message: "Não autorizado" });
  try {
    const token = h.split(" ")[1];
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    next();
  } catch {
    next({ status: 401, message: "Token inválido" });
  }
}
