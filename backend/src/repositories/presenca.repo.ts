import { prisma } from "../db/prisma.js";
import type { StatusPresenca } from "@prisma/client";

interface PresencaData {
  idAluno: string;
  status: StatusPresenca;
  observacao?: string | undefined;
}

export class PresencaRepository {
  async upsertLote(idAula: string, presencas: PresencaData[]) {
    const operations = presencas.map((p) =>
      prisma.presenca.upsert({
        where: {
          idAula_idAluno: {
            idAula,
            idAluno: p.idAluno,
          },
        },
        update: {
          status: p.status,
          observacao: p.observacao ?? null,
          marcadoEm: new Date(),
        },
        create: {
          idAula,
          idAluno: p.idAluno,
          status: p.status,
          observacao: p.observacao ?? null,
        },
      })
    );

    return Promise.all(operations);
  }

  async listarPorAula(idAula: string) {
    return prisma.presenca.findMany({
      where: { idAula },
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
      },
      orderBy: {
        aluno: {
          usuario: {
            nome: "asc",
          },
        },
      },
    });
  }
}
