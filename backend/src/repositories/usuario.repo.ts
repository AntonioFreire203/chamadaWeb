import { prisma } from "../db/prisma.js";
import type { Role } from "@prisma/client";

export const UsuarioRepo = {
  /**
   * Cria um novo usuário
   */
  criar: (data: { nome: string; email: string; senhaHash: string; role: Role }) =>
    prisma.usuario.create({
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
    }),

  /**
   * Busca usuário por email (com senha para login)
   */
  obterPorEmail: (email: string) =>
    prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senhaHash: true,
        role: true,
        ativo: true,
        aluno: { select: { id: true } },
        professor: { select: { id: true } },
      },
    }),

  /**
   * Busca usuário por ID (sem senha)
   */
  obterPorId: (id: string) =>
    prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        aluno: { select: { id: true } },
        professor: { select: { id: true } },
      },
    }),
};
