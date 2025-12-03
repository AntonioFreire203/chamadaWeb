import { prisma } from "../db/prisma.js";
import type { CriarAlunoDTO, AtualizarAlunoDTO } from "../dtos/aluno.dto.js";

export const AlunoRepo = {
  async criar(data: CriarAlunoDTO) {
    return prisma.aluno.create({
      data: {
        idUsuario: data.idUsuario,
        matricula: data.matricula ?? null,
        nascimento: data.nascimento ? new Date(data.nascimento) : null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async listar() {
    return prisma.aluno.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
      },
    });
  },

  async obterPorId(id: string) {
    return prisma.aluno.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async obterPorIdUsuario(idUsuario: string) {
    return prisma.aluno.findUnique({
      where: { idUsuario },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
      },
    });
  },

  async atualizar(id: string, data: AtualizarAlunoDTO) {
    return prisma.aluno.update({
      where: { id },
      data: {
        ...(data.matricula !== undefined && { matricula: data.matricula }),
        ...(data.nascimento !== undefined && {
          nascimento: new Date(data.nascimento),
        }),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    });
  },

  async deletar(id: string) {
    return prisma.aluno.delete({
      where: { id },
    });
  },
};
