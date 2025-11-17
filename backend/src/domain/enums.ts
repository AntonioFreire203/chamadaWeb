/**
 * Papéis/Perfis de usuário no sistema
 */
export enum Role {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  COORDENADOR = "COORDENADOR",
  ALUNO = "ALUNO",
}

/**
 * Status de presença em uma aula
 */
export enum StatusPresenca {
  PRESENTE = "PRESENTE",
  AUSENTE = "AUSENTE",
  ATRASO = "ATRASO",
  JUSTIFICADA = "JUSTIFICADA",
}
