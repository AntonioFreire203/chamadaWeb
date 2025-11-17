/**
 * Classe base para erros customizados da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de não autorizado (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Não autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Erro de acesso negado (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Acesso negado") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Erro de não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso não encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * Erro de conflito (409) - duplicatas, constraints
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflito de dados") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  constructor(message: string = "Dados inválidos") {
    super(message, 400, "VALIDATION_ERROR");
  }
}
