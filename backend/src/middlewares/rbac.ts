import { Request, Response, NextFunction } from "express";

export const rbac = (rolesPermitidos: Array<"ADMIN"|"PROFESSOR"|"GESTOR"|"ALUNO">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !rolesPermitidos.includes(role)) return next({ status: 403, message: "Acesso negado" });
    next();
  };
