import type { Request, Response, NextFunction } from "express";
import { ProfessorService } from "../services/professor.service.js";

export const ProfessorController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    ProfessorService.criar(req.body)
      .then((professor) => res.status(201).json(professor))
      .catch(next);
  },

  async listar(_req: Request, res: Response, next: NextFunction) {
    ProfessorService.listar()
      .then((professores) => res.status(200).json(professores))
      .catch(next);
  },

  async obterPorId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    ProfessorService.obterPorId(id!)
      .then((professor) => res.status(200).json(professor))
      .catch(next);
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    ProfessorService.atualizar(id!, req.body)
      .then((professor) => res.status(200).json(professor))
      .catch(next);
  },

  async deletar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    ProfessorService.deletar(id!)
      .then(() => res.status(204).send())
      .catch(next);
  },

  async vincular(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params; // id da turma
    ProfessorService.vincular(id!, req.body)
      .then((vinculo) => res.status(201).json(vinculo))
      .catch(next);
  },

  async listarProfessoresDaTurma(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    ProfessorService.listarProfessoresDaTurma(id!)
      .then((professores) => res.status(200).json(professores))
      .catch(next);
  },

  async removerVinculo(req: Request, res: Response, next: NextFunction) {
    const { id, idProfessor } = req.params;
    ProfessorService.removerVinculo(id!, idProfessor!)
      .then(() => res.status(204).send())
      .catch(next);
  },
};
