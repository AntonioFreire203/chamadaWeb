import { prisma } from "../db/prisma.js";

export const TurmaProfessorRepo = {
  async vincular(idTurma: string, idProfessor: string, papel?: string) {
    return prisma.turmaProfessor.create({
      data: {
        idTurma,
        idProfessor,
        papel: papel ?? "RESPONSAVEL",
      },
      include: {
        professor: {
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

  async obterVinculo(idTurma: string, idProfessor: string) {
    return prisma.turmaProfessor.findFirst({
      where: {
        idTurma,
        idProfessor,
      },
    });
  },

  async listarProfessoresDaTurma(idTurma: string) {
    return prisma.turmaProfessor.findMany({
      where: { idTurma },
      include: {
        professor: {
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

  async listarTurmasDoProfessor(idProfessor: string) {
    return prisma.turmaProfessor.findMany({
      where: { idProfessor },
      include: {
        turma: true,
      },
    });
  },

  async removerVinculo(idTurma: string, idProfessor: string) {
    return prisma.turmaProfessor.deleteMany({
      where: {
        idTurma,
        idProfessor,
      },
    });
  },
};
