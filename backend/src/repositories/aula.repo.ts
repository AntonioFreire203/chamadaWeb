import type { Aula } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export class AulaRepository {
  async criar(data: {
    idTurma: string;
    titulo?: string;
    conteudo?: string;
    dataAula: Date;
    horaInicio?: Date;
    horaFim?: Date;
  }): Promise<Aula> {
    return await prisma.aula.create({
      data: {
        idTurma: data.idTurma,
        titulo: data.titulo ?? null,
        conteudo: data.conteudo ?? null,
        dataAula: data.dataAula,
        horaInicio: data.horaInicio ?? null,
        horaFim: data.horaFim ?? null,
      },
    });
  }

  async listarPorTurma(
    idTurma: string,
    filtros?: { de?: Date; ate?: Date }
  ): Promise<Aula[]> {
    return await prisma.aula.findMany({
      where: {
        idTurma,
        ...(filtros?.de && { dataAula: { gte: filtros.de } }),
        ...(filtros?.ate && { dataAula: { lte: filtros.ate } }),
      },
      orderBy: { dataAula: "desc" },
    });
  }

  async obterPorId(id: string): Promise<Aula | null> {
    return await prisma.aula.findUnique({
      where: { id },
      include: { turma: true },
    });
  }

  async atualizar(
    id: string,
    data: {
      titulo?: string;
      conteudo?: string;
      dataAula?: Date;
      horaInicio?: Date;
      horaFim?: Date;
    }
  ): Promise<Aula> {
    return await prisma.aula.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo ?? null }),
        ...(data.conteudo !== undefined && { conteudo: data.conteudo ?? null }),
        ...(data.dataAula !== undefined && { dataAula: data.dataAula }),
        ...(data.horaInicio !== undefined && { horaInicio: data.horaInicio ?? null }),
        ...(data.horaFim !== undefined && { horaFim: data.horaFim ?? null }),
      },
    });
  }

  async deletar(id: string): Promise<void> {
    await prisma.aula.delete({ where: { id } });
  }
}
