import type { Request, Response, NextFunction } from "express";
import { AulaService } from "../services/aula.service.js";
import type { CriarAulaDTO, AtualizarAulaDTO } from "../dtos/aula.dto.js";

const aulaService = new AulaService();

export const AulaController = {
  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idTurma, titulo, conteudo, dataAula, horaInicio, horaFim } =
        req.body as CriarAulaDTO;

      const data: {
        idTurma: string;
        titulo?: string;
        conteudo?: string;
        dataAula: Date;
        horaInicio?: Date;
        horaFim?: Date;
      } = {
        idTurma,
        dataAula: new Date(dataAula),
      };

      if (titulo !== undefined) data.titulo = titulo;
      if (conteudo !== undefined) data.conteudo = conteudo;
      if (horaInicio !== undefined) data.horaInicio = new Date(horaInicio);
      if (horaFim !== undefined) data.horaFim = new Date(horaFim);

      const aula = await aulaService.criar(req.user!, data);

      res.status(201).json(aula);
    } catch (error) {
      next(error);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idTurma = req.params.idTurma as string;
      const { de, ate } = req.query as { de?: string; ate?: string };

      const filtros: { de?: string; ate?: string } = {};
      if (de) filtros.de = de;
      if (ate) filtros.ate = ate;

      const aulas = await aulaService.listarPorTurma(idTurma, filtros);

      res.status(200).json(aulas);
    } catch (error) {
      next(error);
    }
  },

  async obter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;

      const aula = await aulaService.obterPorId(id);

      res.status(200).json(aula);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { titulo, conteudo, dataAula, horaInicio, horaFim } =
        req.body as AtualizarAulaDTO;

      const data: {
        titulo?: string;
        conteudo?: string;
        dataAula?: Date;
        horaInicio?: Date;
        horaFim?: Date;
      } = {};

      if (titulo !== undefined) data.titulo = titulo;
      if (conteudo !== undefined) data.conteudo = conteudo;
      if (dataAula !== undefined) data.dataAula = new Date(dataAula);
      if (horaInicio !== undefined) data.horaInicio = new Date(horaInicio);
      if (horaFim !== undefined) data.horaFim = new Date(horaFim);

      const aula = await aulaService.atualizar(req.user!, id, data);

      res.status(200).json(aula);
    } catch (error) {
      next(error);
    }
  },

  async deletar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;

      await aulaService.deletar(req.user!, id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
