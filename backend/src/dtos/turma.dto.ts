import { z } from "zod";

// DTO para criar turma
export const criarTurmaDTO = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  codigo: z.string().optional(),
  anoLetivo: z.number().int().min(2000, "Ano letivo inválido"),
  periodo: z.string().optional(),
  ativo: z.boolean().optional().default(true),
});

// DTO para atualizar turma
export const atualizarTurmaDTO = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  codigo: z.string().optional(),
  anoLetivo: z.number().int().min(2000, "Ano letivo inválido").optional(),
  periodo: z.string().optional(),
  ativo: z.boolean().optional(),
});

// Inferir tipos TypeScript dos schemas Zod
export type CriarTurmaDTO = z.infer<typeof criarTurmaDTO>;
export type AtualizarTurmaDTO = z.infer<typeof atualizarTurmaDTO>;
