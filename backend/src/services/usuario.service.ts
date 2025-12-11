import { UsuarioRepo } from "../repositories/usuario.repo.js";
import type { AtualizarUsuarioDTO } from "../dtos/usuario.dto.js";
import { NotFoundError } from "../utils/errors.js";
import { prisma } from "../db/prisma.js";

export const UsuarioService = {
  async listar() {
    return prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async obterPorId(id: string) {
    const usuario = await UsuarioRepo.obterPorId(id);
    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return usuario;
  },

  async atualizar(id: string, data: AtualizarUsuarioDTO) {
    const usuario = await UsuarioRepo.obterPorId(id);
    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return prisma.usuario.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        role: data.role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
    });
  },

  async deletar(id: string) {
    const usuario = await UsuarioRepo.obterPorId(id);
    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return prisma.usuario.delete({
      where: { id },
    });
  },
};
