import { prisma } from "../db/prisma.js";
import { TurmaRepo } from "../repositories/turma.repo.js";
import { ProfessorRepo } from "../repositories/professor.repo.js";
import { TurmaProfessorRepo } from "../repositories/turmaProfessor.repo.js";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors.js";

export interface JWTPayload {
  sub: string;
  role: string;
}

interface FiltroRelatorio {
  de?: Date;
  ate?: Date;
}

export class RelatorioService {
  async gerarRelatorioPorTurma(
    idTurma: string,
    filtros: FiltroRelatorio,
    user: JWTPayload
  ) {
    // 1. Verificar se turma existe
    const turma = await TurmaRepo.obterPorId(idTurma);
    if (!turma) {
      throw new NotFoundError("Turma não encontrada");
    }

    // 2. Se for PROFESSOR, verificar se está vinculado à turma
    if (user.role === "PROFESSOR") {
      const professor = await ProfessorRepo.obterPorIdUsuario(user.sub);
      if (!professor) {
        throw new ForbiddenError("Professor não encontrado");
      }

      const vinculo = await TurmaProfessorRepo.obterVinculo(idTurma, professor.id);
      if (!vinculo) {
        throw new ForbiddenError("Professor não está vinculado a esta turma");
      }
    }

    // 3. Validar período
    if (filtros.de && filtros.ate && filtros.ate < filtros.de) {
      throw new ValidationError("Data final deve ser maior ou igual à data inicial");
    }

    // 4. Buscar aulas do período
    const whereAulas: any = { idTurma };
    if (filtros.de || filtros.ate) {
      whereAulas.dataAula = {};
      if (filtros.de) whereAulas.dataAula.gte = filtros.de;
      if (filtros.ate) whereAulas.dataAula.lte = filtros.ate;
    }

    const aulas = await prisma.aula.findMany({
      where: whereAulas,
      select: { id: true },
    });

    const idsAulas = aulas.map((a) => a.id);
    const totalAulas = idsAulas.length;

    // 5. Buscar alunos matriculados na turma
    const alunosMatriculados = await prisma.turmaAluno.findMany({
      where: { idTurma },
      include: {
        aluno: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    // 6. Buscar todas as presenças do período
    const presencas = await prisma.presenca.findMany({
      where: {
        idAula: { in: idsAulas },
      },
      select: {
        idAluno: true,
        status: true,
      },
    });

    // 7. Agregar dados por aluno
    const alunosComEstatisticas = alunosMatriculados.map((ta) => {
      const presencasDoAluno = presencas.filter((p) => p.idAluno === ta.idAluno);

      const presente = presencasDoAluno.filter((p) => p.status === "PRESENTE").length;
      const ausente = presencasDoAluno.filter((p) => p.status === "AUSENTE").length;
      const atraso = presencasDoAluno.filter((p) => p.status === "ATRASO").length;
      const justificada = presencasDoAluno.filter((p) => p.status === "JUSTIFICADA").length;
      const totalRegistros = presencasDoAluno.length;

      const percentualPresenca =
        totalAulas > 0 ? ((presente + atraso) / totalAulas) * 100 : 0;
      const percentualAusencia = totalAulas > 0 ? (ausente / totalAulas) * 100 : 0;

      return {
        id: ta.aluno.id,
        nome: ta.aluno.usuario.nome,
        matricula: ta.aluno.matricula,
        estatisticas: {
          presente,
          ausente,
          atraso,
          justificada,
          totalRegistros,
          percentualPresenca: Math.round(percentualPresenca * 100) / 100, // 2 decimais
          percentualAusencia: Math.round(percentualAusencia * 100) / 100,
        },
      };
    });

    // 8. Ordenar por percentual de presença (decrescente)
    alunosComEstatisticas.sort(
      (a, b) => b.estatisticas.percentualPresenca - a.estatisticas.percentualPresenca
    );

    return {
      turma: {
        id: turma.id,
        nome: turma.nome,
        codigo: turma.codigo,
      },
      periodo: {
        de: filtros.de || null,
        ate: filtros.ate || null,
      },
      totalAulas,
      alunos: alunosComEstatisticas,
    };
  }
}
