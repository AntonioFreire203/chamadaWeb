import { AlunoRepo } from "../repositories/aluno.repo.js";
import { UsuarioRepo } from "../repositories/usuario.repo.js";
import { TurmaAlunoRepo } from "../repositories/turmaAluno.repo.js";
import type { CriarAlunoDTO, AtualizarAlunoDTO } from "../dtos/aluno.dto.js";
import type { MatricularAlunoDTO } from "../dtos/vinculo.dto.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.js";

export const AlunoService = {
  async criar(data: CriarAlunoDTO) {
    // Verificar se usuário existe
    const usuario = await UsuarioRepo.obterPorId(data.idUsuario);
    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Verificar se usuário tem role ALUNO
    if (usuario.role !== "ALUNO") {
      throw new ValidationError("Usuário deve ter role ALUNO");
    }

    // Verificar se já existe perfil de aluno para este usuário
    const alunoExistente = await AlunoRepo.obterPorIdUsuario(data.idUsuario);
    if (alunoExistente) {
      throw new ConflictError("Usuário já possui perfil de aluno");
    }

    return AlunoRepo.criar(data);
  },

  async listar() {
    return AlunoRepo.listar();
  },

  async obterPorId(id: string) {
    const aluno = await AlunoRepo.obterPorId(id);
    if (!aluno) {
      throw new NotFoundError("Aluno não encontrado");
    }
    return aluno;
  },

  async atualizar(id: string, data: AtualizarAlunoDTO) {
    const aluno = await AlunoRepo.obterPorId(id);
    if (!aluno) {
      throw new NotFoundError("Aluno não encontrado");
    }

    return AlunoRepo.atualizar(id, data);
  },

  async deletar(id: string) {
    const aluno = await AlunoRepo.obterPorId(id);
    if (!aluno) {
      throw new NotFoundError("Aluno não encontrado");
    }

    return AlunoRepo.deletar(id);
  },

  async matricular(idTurma: string, data: MatricularAlunoDTO) {
    // Verificar se aluno existe
    const aluno = await AlunoRepo.obterPorId(data.idAluno);
    if (!aluno) {
      throw new NotFoundError("Aluno não encontrado");
    }

    // Verificar se já está matriculado
    const vinculoExistente = await TurmaAlunoRepo.obterVinculo(
      idTurma,
      data.idAluno
    );
    if (vinculoExistente) {
      throw new ConflictError("Aluno já matriculado nesta turma");
    }

    return TurmaAlunoRepo.matricular(idTurma, data.idAluno);
  },

  async listarAlunosDaTurma(idTurma: string) {
    return TurmaAlunoRepo.listarAlunosDaTurma(idTurma);
  },

  async removerMatricula(idTurma: string, idAluno: string) {
    const vinculo = await TurmaAlunoRepo.obterVinculo(idTurma, idAluno);
    if (!vinculo) {
      throw new NotFoundError("Matrícula não encontrada");
    }

    return TurmaAlunoRepo.removerMatricula(idTurma, idAluno);
  },
};
