import { prisma } from "../db/prisma.js";

export const TurmaAlunoRepo = {
  async matricular(idTurma: string, idAluno: string) {
    return prisma.turmaAluno.create({
      data: {
        idTurma,
        idAluno,
      },
      include: {
        aluno: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        turma: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
      },
    });
  },

  async obterVinculo(idTurma: string, idAluno: string) {
    return prisma.turmaAluno.findFirst({
      where: {
        idTurma,
        idAluno,
      },
    });
  },

  async listarAlunosDaTurma(idTurma: string) {
    return prisma.turmaAluno.findMany({
      where: { idTurma },
      include: {
        aluno: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                ativo: true,
              },
            },
          },
        },
      },
    });
  },

  async listarTurmasDoAluno(idAluno: string) {
    return prisma.turmaAluno.findMany({
      where: { idAluno },
      include: {
        turma: true,
      },
    });
  },

  async removerMatricula(idTurma: string, idAluno: string) {
    return prisma.turmaAluno.deleteMany({
      where: {
        idTurma,
        idAluno,
      },
    });
  },
};
