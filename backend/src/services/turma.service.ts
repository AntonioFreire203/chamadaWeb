import { TurmaRepo } from "../repositories/turma.repo.js";
import type { CriarTurmaDTO, AtualizarTurmaDTO } from "../dtos/turma.dto.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

export const TurmaService = {
  async criar(data: CriarTurmaDTO) {
    // Verificar se código já existe (se fornecido)
    if (data.codigo) {
      const existente = await TurmaRepo.obterPorCodigo(data.codigo);
      if (existente) {
        throw new ConflictError("Já existe uma turma com este código");
      }
    }

    return TurmaRepo.criar(data);
  },

  async listar() {
    return TurmaRepo.listar();
  },

  async obterPorId(id: string) {
    const turma = await TurmaRepo.obterPorId(id);
    if (!turma) {
      throw new NotFoundError("Turma não encontrada");
    }
    return turma;
  },

  async atualizar(id: string, data: AtualizarTurmaDTO) {
    // Verificar se turma existe
    const turma = await TurmaRepo.obterPorId(id);
    if (!turma) {
      throw new NotFoundError("Turma não encontrada");
    }

    // Verificar se novo código já existe (se fornecido e diferente do atual)
    if (data.codigo && data.codigo !== turma.codigo) {
      const existente = await TurmaRepo.obterPorCodigo(data.codigo);
      if (existente) {
        throw new ConflictError("Já existe uma turma com este código");
      }
    }

    return TurmaRepo.atualizar(id, data);
  },

  async deletar(id: string) {
    // Verificar se turma existe
    const turma = await TurmaRepo.obterPorId(id);
    if (!turma) {
      throw new NotFoundError("Turma não encontrada");
    }

    return TurmaRepo.deletar(id);
  },
};
