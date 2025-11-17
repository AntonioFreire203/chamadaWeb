import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Auth Integration Tests", () => {
  let authToken: string;
  let userId: string;

  // Limpa dados de teste antes de começar
  beforeAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { contains: "@test.com" } },
    });
  });

  // Limpa dados após os testes
  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { contains: "@test.com" } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/v1/auth/register", () => {
    it("deve registrar um novo usuário com sucesso", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          nome: "Admin Teste",
          email: "admin@test.com",
          senha: "senha123",
          role: "ADMIN",
        })
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("usuario");
      expect(response.body.usuario).toHaveProperty("id");
      expect(response.body.usuario.email).toBe("admin@test.com");
      expect(response.body.usuario.role).toBe("ADMIN");

      // Salva o token e userId para próximos testes
      authToken = response.body.token;
      userId = response.body.usuario.id;
    });

    it("deve retornar erro 409 ao tentar registrar email duplicado", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          nome: "Admin Teste 2",
          email: "admin@test.com", // Email já registrado
          senha: "senha123",
          role: "ADMIN",
        })
        .expect(409);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("já cadastrado");
    });

    it("deve retornar erro 400 ao enviar dados inválidos", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          nome: "Te", // Nome muito curto
          email: "email-invalido", // Email inválido
          senha: "123", // Senha muito curta
          role: "ADMIN",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "admin@test.com",
          senha: "senha123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("usuario");
      expect(response.body.usuario.email).toBe("admin@test.com");
    });

    it("deve retornar erro 401 com email inexistente", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "naoexiste@test.com",
          senha: "senha123",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("inválidos");
    });

    it("deve retornar erro 401 com senha incorreta", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "admin@test.com",
          senha: "senhaErrada",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("inválidos");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("deve retornar dados do usuário logado com token válido", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", userId);
      expect(response.body).toHaveProperty("nome", "Admin Teste");
      expect(response.body).toHaveProperty("email", "admin@test.com");
      expect(response.body).toHaveProperty("role", "ADMIN");
      expect(response.body).not.toHaveProperty("senha");
      expect(response.body).not.toHaveProperty("senhaHash");
    });

    it("deve retornar erro 401 sem token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("não fornecido");
    });

    it("deve retornar erro 401 com token inválido", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer token-invalido")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("inválido");
    });
  });

  describe("Fluxo completo: register → login → me", () => {
    it("deve completar o fluxo de autenticação com sucesso", async () => {
      // 1. Register
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          nome: "Professor Teste",
          email: "professor@test.com",
          senha: "senha123",
          role: "PROFESSOR",
        })
        .expect(201);

      expect(registerRes.body).toHaveProperty("token");
      const registerToken = registerRes.body.token;

      // 2. Login
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "professor@test.com",
          senha: "senha123",
        })
        .expect(200);

      expect(loginRes.body).toHaveProperty("token");
      const loginToken = loginRes.body.token;

      // 3. Me (com token do register)
      const meRes1 = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${registerToken}`)
        .expect(200);

      expect(meRes1.body.role).toBe("PROFESSOR");

      // 4. Me (com token do login)
      const meRes2 = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${loginToken}`)
        .expect(200);

      expect(meRes2.body.role).toBe("PROFESSOR");
      expect(meRes2.body.email).toBe("professor@test.com");
    });
  });
});
