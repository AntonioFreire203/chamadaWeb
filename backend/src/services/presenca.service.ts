import { PresencaRepository } from "../repositories/presenca.repo.js";
import { AulaRepository } from "../repositories/aula.repo.js";
import { TurmaAlunoRepo } from "../repositories/turmaAluno.repo.js";
import { ProfessorRepo } from "../repositories/professor.repo.js";
import { TurmaProfessorRepo } from "../repositories/turmaProfessor.repo.js";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors.js";
import type { StatusPresenca } from "@prisma/client";

export interface JWTPayload {
  sub: string;
  role: string;
}

interface PresencaData {
  idAluno: string;
  status: StatusPresenca;
  observacao?: string | undefined;
}

export class PresencaService {
  private presencaRepo = new PresencaRepository();
  private aulaRepo = new AulaRepository();

  async marcarPresencas(idAula: string, presencas: PresencaData[], user: JWTPayload) {
    // 1. Verificar se a aula existe
    const aula = await this.aulaRepo.obterPorId(idAula);
    if (!aula) {
      throw new NotFoundError("Aula não encontrada");
    }

    // 2. Se for PROFESSOR, verificar se está vinculado à turma
    if (user.role === "PROFESSOR") {
      const professor = await ProfessorRepo.obterPorIdUsuario(user.sub);
      if (!professor) {
        throw new ForbiddenError("Professor não encontrado");
      }

      const vinculo = await TurmaProfessorRepo.obterVinculo(aula.idTurma, professor.id);
      if (!vinculo) {
        throw new ForbiddenError("Professor não está vinculado a esta turma");
      }
    }

    // 3. Verificar se todos os alunos estão matriculados na turma
    const idsAlunos = presencas.map((p) => p.idAluno);
    const alunosMatriculados = await TurmaAlunoRepo.listarAlunosDaTurma(aula.idTurma);
    const idsAlunosMatriculados = new Set(alunosMatriculados.map((a: { idAluno: string }) => a.idAluno));

    const alunosNaoMatriculados = idsAlunos.filter((id) => !idsAlunosMatriculados.has(id));
    if (alunosNaoMatriculados.length > 0) {
      throw new ValidationError(
        `Alunos não matriculados na turma: ${alunosNaoMatriculados.join(", ")}`
      );
    }

    // 4. Marcar presenças (upsert)
    return this.presencaRepo.upsertLote(idAula, presencas);
  }

  async listarPresencas(idAula: string) {
    // Verificar se a aula existe
    const aula = await this.aulaRepo.obterPorId(idAula);
    if (!aula) {
      throw new NotFoundError("Aula não encontrada");
    }

    return this.presencaRepo.listarPorAula(idAula);
  }
}
