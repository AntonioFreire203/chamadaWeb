import type { Request, Response, NextFunction } from "express";
import { UsuarioService } from "../services/usuario.service.js";

export const UsuarioController = {
  async listar(_req: Request, res: Response, next: NextFunction) {
    UsuarioService.listar()
      .then((usuarios) => res.status(200).json(usuarios))
      .catch(next);
  },

  async obterPorId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    UsuarioService.obterPorId(id!)
      .then((usuario) => res.status(200).json(usuario))
      .catch(next);
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    UsuarioService.atualizar(id!, req.body)
      .then((usuario) => res.status(200).json(usuario))
      .catch(next);
  },

  async deletar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    UsuarioService.deletar(id!)
      .then(() => res.status(204).send())
      .catch(next);
  },
};
