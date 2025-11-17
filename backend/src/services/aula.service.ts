import type { Aula } from "@prisma/client";
import type { JwtUser } from "../middlewares/auth.js";
import { AulaRepository } from "../repositories/aula.repo.js";
import { TurmaRepo } from "../repositories/turma.repo.js";
import { ProfessorRepo } from "../repositories/professor.repo.js";
import { TurmaProfessorRepo } from "../repositories/turmaProfessor.repo.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export class AulaService {
  private aulaRepo = new AulaRepository();
  private turmaRepo = TurmaRepo;
  private professorRepo = ProfessorRepo;
  private turmaProfessorRepo = TurmaProfessorRepo;

  async criar(
    user: JwtUser,
    data: {
      idTurma: string;
      titulo?: string;
      conteudo?: string;
      dataAula: Date;
      horaInicio?: Date;
      horaFim?: Date;
    }
  ): Promise<Aula> {
    // Verificar se turma existe
    const turma = await this.turmaRepo.obterPorId(data.idTurma);
    if (!turma) {
      throw new NotFoundError("Turma não encontrada");
    }

    // Se o usuário for PROFESSOR, validar vínculo
    if (user.role === "PROFESSOR") {
      const professor = await this.professorRepo.obterPorIdUsuario(user.sub);
      if (!professor) {
        throw new ForbiddenError("Professor não possui perfil cadastrado");
      }

      const vinculo = await this.turmaProfessorRepo.obterVinculo(
        data.idTurma,
        professor.id
      );
      if (!vinculo) {
        throw new ForbiddenError("Professor não está vinculado a esta turma");
      }
    }

    return await this.aulaRepo.criar(data);
  }

  async listarPorTurma(
    idTurma: string,
    filtros?: { de?: string; ate?: string }
  ): Promise<Aula[]> {
    const turma = await this.turmaRepo.obterPorId(idTurma);
    if (!turma) {
      throw new NotFoundError("Turma não encontrada");
    }

    const filtrosDatas: { de?: Date; ate?: Date } = {};
    if (filtros?.de) {
      filtrosDatas.de = new Date(filtros.de);
    }
    if (filtros?.ate) {
      filtrosDatas.ate = new Date(filtros.ate);
    }

    return await this.aulaRepo.listarPorTurma(idTurma, filtrosDatas);
  }

  async obterPorId(id: string): Promise<Aula> {
    const aula = await this.aulaRepo.obterPorId(id);
    if (!aula) {
      throw new NotFoundError("Aula não encontrada");
    }
    return aula;
  }

  async atualizar(
    user: JwtUser,
    id: string,
    data: {
      titulo?: string;
      conteudo?: string;
      dataAula?: Date;
      horaInicio?: Date;
      horaFim?: Date;
    }
  ): Promise<Aula> {
    const aula = await this.aulaRepo.obterPorId(id);
    if (!aula) {
      throw new NotFoundError("Aula não encontrada");
    }

    // Se o usuário for PROFESSOR, validar vínculo
    if (user.role === "PROFESSOR") {
      const professor = await this.professorRepo.obterPorIdUsuario(user.sub);
      if (!professor) {
        throw new ForbiddenError("Professor não possui perfil cadastrado");
      }

      const vinculo = await this.turmaProfessorRepo.obterVinculo(
        aula.idTurma,
        professor.id
      );
      if (!vinculo) {
        throw new ForbiddenError("Professor não está vinculado a esta turma");
      }
    }

    return await this.aulaRepo.atualizar(id, data);
  }

  async deletar(user: JwtUser, id: string): Promise<void> {
    const aula = await this.aulaRepo.obterPorId(id);
    if (!aula) {
      throw new NotFoundError("Aula não encontrada");
    }

    // Se o usuário for PROFESSOR, validar vínculo
    if (user.role === "PROFESSOR") {
      const professor = await this.professorRepo.obterPorIdUsuario(user.sub);
      if (!professor) {
        throw new ForbiddenError("Professor não possui perfil cadastrado");
      }

      const vinculo = await this.turmaProfessorRepo.obterVinculo(
        aula.idTurma,
        professor.id
      );
      if (!vinculo) {
        throw new ForbiddenError("Professor não está vinculado a esta turma");
      }
    }

    await this.aulaRepo.deletar(id);
  }
}
