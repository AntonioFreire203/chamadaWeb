import type { Request, Response, NextFunction } from "express";
import { PresencaService } from "../services/presenca.service.js";
import type { MarcarPresencasInput } from "../dtos/presenca.dto.js";
import type { StatusPresenca } from "@prisma/client";

const presencaService = new PresencaService();

interface PresencaData {
  idAluno: string;
  status: StatusPresenca;
  observacao?: string | undefined;
}

export const PresencaController = {
  async marcar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: idAula } = req.params as { id: string };
      const { presencas: presencasInput } = req.body as MarcarPresencasInput;

      // Converter para o formato com observacao?: string | undefined
      const presencas: PresencaData[] = presencasInput.map((p) => ({
        idAluno: p.idAluno,
        status: p.status,
        observacao: p.observacao !== undefined ? p.observacao : undefined,
      }));

      const resultado = await presencaService.marcarPresencas(idAula, presencas, req.user!);

      res.status(200).json({
        message: "Presenças marcadas com sucesso",
        total: resultado.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: idAula } = req.params as { id: string };

      const presencas = await presencaService.listarPresencas(idAula);

      res.status(200).json(presencas);
    } catch (error) {
      next(error);
    }
  },
};
