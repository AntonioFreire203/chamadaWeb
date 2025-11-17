import type { Request, Response, NextFunction } from "express";
import { RelatorioService } from "../services/relatorio.service.js";

const relatorioService = new RelatorioService();

export const RelatorioController = {
  async gerarRelatorioPorTurma(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: idTurma } = req.params as { id: string };
      const { de, ate } = req.query as { de?: string; ate?: string };

      const filtros: { de?: Date; ate?: Date } = {};
      if (de) filtros.de = new Date(de);
      if (ate) filtros.ate = new Date(ate);

      const relatorio = await relatorioService.gerarRelatorioPorTurma(
        idTurma,
        filtros,
        req.user!
      );

      res.status(200).json(relatorio);
    } catch (error) {
      next(error);
    }
  },
};
