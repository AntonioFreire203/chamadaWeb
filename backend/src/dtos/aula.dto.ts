import { z } from "zod";

export const criarAulaDTO = z.object({
  idTurma: z.string().uuid("ID da turma deve ser um UUID válido").optional(), // Opcional pois pode vir dos params
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres").optional(),
  conteudo: z.string().optional(),
  dataAula: z.string().datetime("Data da aula deve ser um DateTime válido (ISO 8601)"),
  horaInicio: z.string().datetime("Hora de início deve ser um DateTime válido (ISO 8601)").optional(),
  horaFim: z.string().datetime("Hora de fim deve ser um DateTime válido (ISO 8601)").optional(),
});

export const atualizarAulaDTO = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres").optional(),
  conteudo: z.string().optional(),
  dataAula: z.string().datetime("Data da aula deve ser um DateTime válido (ISO 8601)").optional(),
  horaInicio: z.string().datetime("Hora de início deve ser um DateTime válido (ISO 8601)").optional(),
  horaFim: z.string().datetime("Hora de fim deve ser um DateTime válido (ISO 8601)").optional(),
});

export type CriarAulaDTO = z.infer<typeof criarAulaDTO>;
export type AtualizarAulaDTO = z.infer<typeof atualizarAulaDTO>;
