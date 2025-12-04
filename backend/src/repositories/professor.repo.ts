import { prisma } from "../db/prisma.js";
import type {
  CriarProfessorDTO,
  AtualizarProfessorDTO,
} from "../dtos/professor.dto.js";

export const ProfessorRepo = {
  async criar(data: CriarProfessorDTO) {
    return prisma.professor.create({
      data: {
        idUsuario: data.idUsuario,
        apelido: data.apelido ?? null,
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
        _count: {
          select: {
            turmas: true
          }
        }
      },
    });
  },

  async listar() {
    return prisma.professor.findMany({
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
        _count: { 
          select: {
            turmas: true
          }
        }
      },
    });
  },

  async obterPorId(id: string) {
    return prisma.professor.findUnique({
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
        _count: {
            select: { turmas: true }
        }
      },
    });
  },

  async obterPorIdUsuario(idUsuario: string) {
    return prisma.professor.findUnique({
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

  async atualizar(id: string, data: AtualizarProfessorDTO) {
    return prisma.professor.update({
      where: { id },
      data: {
        ...(data.apelido !== undefined && { apelido: data.apelido }),
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
    return prisma.professor.delete({
      where: { id },
    });
  },
};
