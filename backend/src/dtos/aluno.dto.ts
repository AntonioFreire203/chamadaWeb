import { z } from "zod";

// DTO para criar perfil de aluno
export const criarAlunoDTO = z.object({
  idUsuario: z.string().uuid("ID de usuário inválido"),
  matricula: z.string().optional(),
  nascimento: z.string().datetime().optional(),
});

// DTO para atualizar perfil de aluno
export const atualizarAlunoDTO = z.object({
  matricula: z.string().optional(),
  nascimento: z.string().datetime().optional(),
});

export type CriarAlunoDTO = z.infer<typeof criarAlunoDTO>;
export type AtualizarAlunoDTO = z.infer<typeof atualizarAlunoDTO>;
