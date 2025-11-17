import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { UsuarioRepo } from "../repositories/usuario.repo.js";
import { ConflictError, UnauthorizedError, NotFoundError } from "../utils/errors.js";
import type { RegisterDTO, LoginDTO } from "../dtos/auth.dto.js";
import type { JwtUser } from "../middlewares/auth.js";

export const AuthService = {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterDTO) {
    // Verifica se email já existe
    const existente = await UsuarioRepo.obterPorEmail(data.email);
    if (existente) {
      throw new ConflictError("Email já cadastrado");
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Cria usuário
    const usuario = await UsuarioRepo.criar({
      nome: data.nome,
      email: data.email,
      senhaHash,
      role: data.role,
    });

    // Cria perfil automaticamente baseado no role
    if (data.role === "PROFESSOR") {
      await prisma.professor.create({
        data: {
          idUsuario: usuario.id,
        },
      });
    } else if (data.role === "ALUNO") {
      await prisma.aluno.create({
        data: {
          idUsuario: usuario.id,
        },
      });
    }

    // Gera token
    const token = this.generateToken({
      sub: usuario.id,
      role: usuario.role,
      id_professor: null,
      id_aluno: null,
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      token,
    };
  },

  /**
   * Realiza login
   */
  async login(data: LoginDTO) {
    // Busca usuário
    const usuario = await UsuarioRepo.obterPorEmail(data.email);
    if (!usuario) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    // Verifica se está ativo
    if (!usuario.ativo) {
      throw new UnauthorizedError("Usuário inativo");
    }

    // Valida senha
    const senhaValida = await bcrypt.compare(data.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    // Gera token
    const token = this.generateToken({
      sub: usuario.id,
      role: usuario.role,
      id_professor: usuario.professor?.id ?? null,
      id_aluno: usuario.aluno?.id ?? null,
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      token,
    };
  },

  /**
   * Obtém dados do usuário logado
   */
  async me(userId: string) {
    const usuario = await UsuarioRepo.obterPorId(userId);
    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo,
    };
  },

  /**
   * Gera token JWT
   */
  generateToken(payload: JwtUser): string {
    return jwt.sign(payload, env.JWT_SECRET || "secret", {
      expiresIn: "7d", // Token expira em 7 dias
    });
  },
};
