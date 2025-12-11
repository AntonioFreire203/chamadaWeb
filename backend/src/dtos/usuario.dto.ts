import { z } from "zod";
import { Role } from "@prisma/client";

// DTO para atualizar usuário
export const atualizarUsuarioDTO = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.nativeEnum(Role, { message: "Role inválida" }).optional(),
});

export type AtualizarUsuarioDTO = z.infer<typeof atualizarUsuarioDTO>;
