// src/middlewares/rbac.ts
import { Request, Response, NextFunction } from "express";

export type Role = "ADMIN" | "COORDENADOR" | "PROFESSOR" | "ALUNO";

export const Actions = {
  USER_READ_SELF: "USER_READ_SELF",

  TURMA_CREATE: "TURMA_CREATE",
  TURMA_LIST: "TURMA_LIST",
  TURMA_GET: "TURMA_GET",
  TURMA_ALUNO_ADD: "TURMA_ALUNO_ADD",
  TURMA_PROFESSOR_ADD: "TURMA_PROFESSOR_ADD",

  AULA_CREATE: "AULA_CREATE",
  AULA_LIST_BY_TURMA: "AULA_LIST_BY_TURMA",
  AULA_GET: "AULA_GET",

  PRESENCA_BATCH_MARK: "PRESENCA_BATCH_MARK",
  PRESENCA_LIST_BY_AULA: "PRESENCA_LIST_BY_AULA",
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];

export const RolePermissions: Record<Role, ReadonlyArray<Action>> = {
  ADMIN: [
    Actions.USER_READ_SELF,
    Actions.TURMA_CREATE,
    Actions.TURMA_LIST,
    Actions.TURMA_GET,
    Actions.TURMA_ALUNO_ADD,
    Actions.TURMA_PROFESSOR_ADD,
    Actions.AULA_CREATE,
    Actions.AULA_LIST_BY_TURMA,
    Actions.AULA_GET,
    Actions.PRESENCA_BATCH_MARK,
    Actions.PRESENCA_LIST_BY_AULA,
  ],
  COORDENADOR: [
    Actions.USER_READ_SELF,
    Actions.TURMA_CREATE,
    Actions.TURMA_LIST,
    Actions.TURMA_GET,
    Actions.TURMA_ALUNO_ADD,
    Actions.TURMA_PROFESSOR_ADD,
    Actions.AULA_LIST_BY_TURMA,
    Actions.AULA_GET,
    Actions.PRESENCA_LIST_BY_AULA,
  ],
  PROFESSOR: [
    Actions.USER_READ_SELF,
    Actions.AULA_CREATE,
    Actions.AULA_LIST_BY_TURMA,
    Actions.AULA_GET,
    Actions.PRESENCA_BATCH_MARK,
    Actions.PRESENCA_LIST_BY_AULA,
    Actions.TURMA_LIST,
    Actions.TURMA_GET,
  ],
  ALUNO: [Actions.USER_READ_SELF],
};

export function hasPermission(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  const allowed = RolePermissions[role] ?? [];
  return allowed.includes(action);
}

/** Middleware: rbac por AÇÃO */
export const rbacPermit =
  (action: Action) => (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role as Role | undefined;
    if (!hasPermission(role, action)) {
      return next({ status: 403, message: "Acesso negado" });
    }
    next();
  };
