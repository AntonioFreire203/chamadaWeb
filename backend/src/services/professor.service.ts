import { ProfessorRepo } from "../repositories/professor.repo.js";
import { UsuarioRepo } from "../repositories/usuario.repo.js";
import { TurmaProfessorRepo } from "../repositories/turmaProfessor.repo.js";
import type {
  CriarProfessorDTO,
  AtualizarProfessorDTO,
} from "../dtos/professor.dto.js";
import type { VincularProfessorDTO } from "../dtos/vinculo.dto.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.js";

export const ProfessorService = {
  async criar(data: CriarProfessorDTO) {
    // Verificar se usuário existe
    const usuario = await UsuarioRepo.obterPorId(data.idUsuario);
    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Verificar se usuário tem role PROFESSOR
    if (usuario.role !== "PROFESSOR") {
      throw new ValidationError("Usuário deve ter role PROFESSOR");
    }

    // Verificar se já existe perfil de professor para este usuário
    const professorExistente = await ProfessorRepo.obterPorIdUsuario(
      data.idUsuario
    );
    if (professorExistente) {
      throw new ConflictError("Usuário já possui perfil de professor");
    }

    return ProfessorRepo.criar(data);
  },

  async listar() {
    return ProfessorRepo.listar();
  },

  async obterPorId(id: string) {
    const professor = await ProfessorRepo.obterPorId(id);
    if (!professor) {
      throw new NotFoundError("Professor não encontrado");
    }
    return professor;
  },

  async atualizar(id: string, data: AtualizarProfessorDTO) {
    const professor = await ProfessorRepo.obterPorId(id);
    if (!professor) {
      throw new NotFoundError("Professor não encontrado");
    }

    return ProfessorRepo.atualizar(id, data);
  },

  async deletar(id: string) {
    const professor = await ProfessorRepo.obterPorId(id);
    if (!professor) {
      throw new NotFoundError("Professor não encontrado");
    }

    return ProfessorRepo.deletar(id);
  },

  async vincular(idTurma: string, data: VincularProfessorDTO) {
    // Verificar se professor existe
    const professor = await ProfessorRepo.obterPorId(data.idProfessor);
    if (!professor) {
      throw new NotFoundError("Professor não encontrado");
    }

    // Verificar se já está vinculado
    const vinculoExistente = await TurmaProfessorRepo.obterVinculo(
      idTurma,
      data.idProfessor
    );
    if (vinculoExistente) {
      throw new ConflictError("Professor já vinculado a esta turma");
    }

    return TurmaProfessorRepo.vincular(
      idTurma,
      data.idProfessor,
      data.papel
    );
  },

  async listarProfessoresDaTurma(idTurma: string) {
    return TurmaProfessorRepo.listarProfessoresDaTurma(idTurma);
  },

  async removerVinculo(idTurma: string, idProfessor: string) {
    const vinculo = await TurmaProfessorRepo.obterVinculo(
      idTurma,
      idProfessor
    );
    if (!vinculo) {
      throw new NotFoundError("Vínculo não encontrado");
    }

    return TurmaProfessorRepo.removerVinculo(idTurma, idProfessor);
  },
};
