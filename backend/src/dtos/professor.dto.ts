import { z } from "zod";

// DTO para criar perfil de professor
export const criarProfessorDTO = z.object({
  idUsuario: z.string().uuid("ID de usuário inválido"),
  apelido: z.string().optional(),
});

// DTO para atualizar perfil de professor
export const atualizarProfessorDTO = z.object({
  apelido: z.string().optional(),
});

export type CriarProfessorDTO = z.infer<typeof criarProfessorDTO>;
export type AtualizarProfessorDTO = z.infer<typeof atualizarProfessorDTO>;
