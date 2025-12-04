import { prisma } from "../db/prisma.js";
import type { CriarTurmaDTO, AtualizarTurmaDTO } from "../dtos/turma.dto.js";

export const TurmaRepo = {
  async criar(data: CriarTurmaDTO) {
    return prisma.turma.create({
      data: {
        nome: data.nome,
        codigo: data.codigo ?? null,
        anoLetivo: data.anoLetivo,
        periodo: data.periodo ?? null,
        ativo: data.ativo ?? true,
      },
    });
  },

  async listar() {
    return prisma.turma.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { alunos: true }
        },
        professores: {
          include: {
            professor: {
              include: {
                usuario: { select: { nome: true } } 
              }
            }
          },
          take: 1 
        }
      }
    });
  },

  async obterPorId(id: string) {
    return prisma.turma.findUnique({
      where: { id },
      include: {
        _count: {
          select: { alunos: true }
        },
        professores: {
          include: {
            professor: {
              include: {
                usuario: { select: { nome: true } }
              }
            }
          }
        },
        alunos: {
          include: {
            aluno: {
              include: {
                usuario: { select: { nome: true, email: true } }
              }
            }
          }
        }
      }
    });
  },

  async obterPorCodigo(codigo: string) {
    return prisma.turma.findUnique({
      where: { codigo },
    });
  },

  async atualizar(id: string, data: AtualizarTurmaDTO) {
    return prisma.turma.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.anoLetivo !== undefined && { anoLetivo: data.anoLetivo }),
        ...(data.periodo !== undefined && { periodo: data.periodo }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
      },
    });
  },

  async deletar(id: string) {
    return prisma.turma.delete({
      where: { id },
    });
  },
};