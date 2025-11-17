// src/middlewares/rbac.ts
import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";

export type Role = "ADMIN" | "COORDENADOR" | "PROFESSOR" | "ALUNO";

export const Actions = {
  USER_READ_SELF: "USER_READ_SELF",

  ALUNO_CREATE: "ALUNO_CREATE",
  ALUNO_READ: "ALUNO_READ",
  ALUNO_UPDATE: "ALUNO_UPDATE",
  ALUNO_DELETE: "ALUNO_DELETE",

  PROFESSOR_CREATE: "PROFESSOR_CREATE",
  PROFESSOR_READ: "PROFESSOR_READ",
  PROFESSOR_UPDATE: "PROFESSOR_UPDATE",
  PROFESSOR_DELETE: "PROFESSOR_DELETE",

  TURMA_CREATE: "TURMA_CREATE",
  TURMA_LIST: "TURMA_LIST",
  TURMA_GET: "TURMA_GET",
  TURMA_UPDATE: "TURMA_UPDATE",
  TURMA_DELETE: "TURMA_DELETE",
  TURMA_ALUNO_ADD: "TURMA_ALUNO_ADD",
  TURMA_PROFESSOR_ADD: "TURMA_PROFESSOR_ADD",

  AULA_CREATE: "AULA_CREATE",
  AULA_LIST_BY_TURMA: "AULA_LIST_BY_TURMA",
  AULA_GET: "AULA_GET",
  AULA_UPDATE: "AULA_UPDATE",
  AULA_DELETE: "AULA_DELETE",

  PRESENCA_BATCH_MARK: "PRESENCA_BATCH_MARK",
  PRESENCA_LIST_BY_AULA: "PRESENCA_LIST_BY_AULA",

  RELATORIO_PRESENCA_TURMA: "RELATORIO_PRESENCA_TURMA",
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];

export const RolePermissions: Record<Role, ReadonlyArray<Action>> = {
  ADMIN: [
    Actions.USER_READ_SELF,
    Actions.ALUNO_CREATE,
    Actions.ALUNO_READ,
    Actions.ALUNO_UPDATE,
    Actions.ALUNO_DELETE,
    Actions.PROFESSOR_CREATE,
    Actions.PROFESSOR_READ,
    Actions.PROFESSOR_UPDATE,
    Actions.PROFESSOR_DELETE,
    Actions.TURMA_CREATE,
    Actions.TURMA_LIST,
    Actions.TURMA_GET,
    Actions.TURMA_UPDATE,
    Actions.TURMA_DELETE,
    Actions.TURMA_ALUNO_ADD,
    Actions.TURMA_PROFESSOR_ADD,
    Actions.AULA_CREATE,
    Actions.AULA_LIST_BY_TURMA,
    Actions.AULA_GET,
    Actions.AULA_UPDATE,
    Actions.AULA_DELETE,
    Actions.PRESENCA_BATCH_MARK,
    Actions.PRESENCA_LIST_BY_AULA,
    Actions.RELATORIO_PRESENCA_TURMA,
  ],
  COORDENADOR: [
    Actions.USER_READ_SELF,
    Actions.ALUNO_CREATE,
    Actions.ALUNO_READ,
    Actions.ALUNO_UPDATE,
    Actions.PROFESSOR_CREATE,
    Actions.PROFESSOR_READ,
    Actions.PROFESSOR_UPDATE,
    Actions.TURMA_CREATE,
    Actions.TURMA_LIST,
    Actions.TURMA_GET,
    Actions.TURMA_UPDATE,
    Actions.TURMA_ALUNO_ADD,
    Actions.TURMA_PROFESSOR_ADD,
    Actions.AULA_LIST_BY_TURMA,
    Actions.AULA_GET,
    Actions.PRESENCA_LIST_BY_AULA,
    Actions.RELATORIO_PRESENCA_TURMA,
  ],
  PROFESSOR: [
    Actions.USER_READ_SELF,
    Actions.AULA_CREATE,
    Actions.AULA_LIST_BY_TURMA,
    Actions.AULA_GET,
    Actions.AULA_UPDATE,
    Actions.AULA_DELETE,
    Actions.PRESENCA_BATCH_MARK,
    Actions.PRESENCA_LIST_BY_AULA,
    Actions.RELATORIO_PRESENCA_TURMA,
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
      return next(new ForbiddenError("Acesso negado"));
    }
    next();
  };
