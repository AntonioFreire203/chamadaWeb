import { z } from "zod";

const statusPresencaEnum = z.enum(["PRESENTE", "AUSENTE", "ATRASO", "JUSTIFICADA"], {
  message: "Status deve ser PRESENTE, AUSENTE, ATRASO ou JUSTIFICADA",
});

const presencaItemSchema = z.object({
  idAluno: z.string().uuid({ message: "idAluno deve ser um UUID válido" }),
  status: statusPresencaEnum,
  observacao: z.string().optional(),
});

export const marcarPresencasDTO = z.object({
  presencas: z
    .array(presencaItemSchema)
    .min(1, { message: "Deve haver pelo menos uma presença para marcar" }),
});

export type MarcarPresencasInput = z.infer<typeof marcarPresencasDTO>;
export type PresencaItem = z.infer<typeof presencaItemSchema>;
