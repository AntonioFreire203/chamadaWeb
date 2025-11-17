import { z } from "zod";

// DTO para matricular aluno em turma
export const matricularAlunoDTO = z.object({
  idAluno: z.string().uuid("ID de aluno inválido"),
});

// DTO para vincular professor a turma
export const vincularProfessorDTO = z.object({
  idProfessor: z.string().uuid("ID de professor inválido"),
  papel: z.string().optional().default("RESPONSAVEL"),
});

export type MatricularAlunoDTO = z.infer<typeof matricularAlunoDTO>;
export type VincularProfessorDTO = z.infer<typeof vincularProfessorDTO>;
