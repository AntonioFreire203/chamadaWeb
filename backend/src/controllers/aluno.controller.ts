import type { Request, Response, NextFunction } from "express";
import { AlunoService } from "../services/aluno.service.js";

export const AlunoController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    AlunoService.criar(req.body)
      .then((aluno) => res.status(201).json(aluno))
      .catch(next);
  },

  async listar(_req: Request, res: Response, next: NextFunction) {
    AlunoService.listar()
      .then((alunos) => res.status(200).json(alunos))
      .catch(next);
  },

  async obterPorId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    AlunoService.obterPorId(id!)
      .then((aluno) => res.status(200).json(aluno))
      .catch(next);
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    AlunoService.atualizar(id!, req.body)
      .then((aluno) => res.status(200).json(aluno))
      .catch(next);
  },

  async deletar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    AlunoService.deletar(id!)
      .then(() => res.status(204).send())
      .catch(next);
  },

  async matricular(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params; // id da turma
    AlunoService.matricular(id!, req.body)
      .then((matricula) => res.status(201).json(matricula))
      .catch(next);
  },

  async listarAlunosDaTurma(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    AlunoService.listarAlunosDaTurma(id!)
      .then((alunos) => res.status(200).json(alunos))
      .catch(next);
  },

  async removerMatricula(req: Request, res: Response, next: NextFunction) {
    const { id, idAluno } = req.params;
    AlunoService.removerMatricula(id!, idAluno!)
      .then(() => res.status(204).send())
      .catch(next);
  },
};
