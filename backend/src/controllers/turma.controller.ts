import type { Request, Response, NextFunction } from "express";
import { TurmaService } from "../services/turma.service.js";

export const TurmaController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    TurmaService.criar(req.body)
      .then((turma) => res.status(201).json(turma))
      .catch(next);
  },

  async listar(_req: Request, res: Response, next: NextFunction) {
    TurmaService.listar()
      .then((turmas) => res.status(200).json(turmas))
      .catch(next);
  },

  async obterPorId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    TurmaService.obterPorId(id!)
      .then((turma) => res.status(200).json(turma))
      .catch(next);
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    TurmaService.atualizar(id!, req.body)
      .then((turma) => res.status(200).json(turma))
      .catch(next);
  },

  async deletar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    TurmaService.deletar(id!)
      .then(() => res.status(204).send())
      .catch(next);
  },
};
