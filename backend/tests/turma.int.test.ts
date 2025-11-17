import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Turma Integration Tests", () => {
  let adminToken: string;
  let coordenadorToken: string;
  let professorToken: string;
  let turmaId: string;

  beforeAll(async () => {
    // Limpar dados de teste
    await prisma.turma.deleteMany({
      where: { codigo: { startsWith: "TEST-" } },
    });
    await prisma.usuario.deleteMany({
      where: { email: { contains: "@turma-test.com" } },
    });

    // Criar usuários de teste
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      nome: "Admin Turma Test",
      email: "admin@turma-test.com",
      senha: "senha123",
      role: "ADMIN",
    });
    adminToken = adminRes.body.token;

    const coordRes = await request(app).post("/api/v1/auth/register").send({
      nome: "Coordenador Turma Test",
      email: "coord@turma-test.com",
      senha: "senha123",
      role: "COORDENADOR",
    });
    coordenadorToken = coordRes.body.token;

    const profRes = await request(app).post("/api/v1/auth/register").send({
      nome: "Professor Turma Test",
      email: "prof@turma-test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    professorToken = profRes.body.token;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.turma.deleteMany({
      where: { codigo: { startsWith: "TEST-" } },
    });
    await prisma.usuario.deleteMany({
      where: { email: { contains: "@turma-test.com" } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/v1/turmas", () => {
    it("deve criar uma turma com sucesso (ADMIN)", async () => {
      const res = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "Turma de Teste 1",
          codigo: "TEST-001",
          anoLetivo: 2025,
          periodo: "1º Semestre",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.nome).toBe("Turma de Teste 1");
      expect(res.body.codigo).toBe("TEST-001");
      expect(res.body.anoLetivo).toBe(2025);
      turmaId = res.body.id;
    });

    it("deve criar uma turma com sucesso (COORDENADOR)", async () => {
      const res = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${coordenadorToken}`)
        .send({
          nome: "Turma de Teste 2",
          codigo: "TEST-002",
          anoLetivo: 2025,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.codigo).toBe("TEST-002");
    });

    it("deve retornar erro 403 ao tentar criar turma (PROFESSOR)", async () => {
      const res = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${professorToken}`)
        .send({
          nome: "Turma Não Permitida",
          anoLetivo: 2025,
        });

      expect(res.status).toBe(403);
    });

    it("deve retornar erro 409 ao criar turma com código duplicado", async () => {
      const res = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "Turma Duplicada",
          codigo: "TEST-001",
          anoLetivo: 2025,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("código");
    });

    it("deve retornar erro 400 ao enviar dados inválidos", async () => {
      const res = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "AB", // muito curto
          anoLetivo: 1999, // ano inválido
        });

      expect(res.status).toBe(400);
    });

    it("deve retornar erro 401 sem token", async () => {
      const res = await request(app).post("/api/v1/turmas").send({
        nome: "Turma Sem Auth",
        anoLetivo: 2025,
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/turmas", () => {
    it("deve listar turmas (qualquer autenticado)", async () => {
      const res = await request(app)
        .get("/api/v1/turmas")
        .set("Authorization", `Bearer ${professorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("deve retornar erro 401 sem token", async () => {
      const res = await request(app).get("/api/v1/turmas");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/turmas/:id", () => {
    it("deve obter turma por ID (qualquer autenticado)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(turmaId);
      expect(res.body.nome).toBe("Turma de Teste 1");
    });

    it("deve retornar erro 404 para turma inexistente", async () => {
      const res = await request(app)
        .get("/api/v1/turmas/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("deve retornar erro 401 sem token", async () => {
      const res = await request(app).get(`/api/v1/turmas/${turmaId}`);

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/turmas/:id", () => {
    it("deve atualizar turma com sucesso (ADMIN)", async () => {
      const res = await request(app)
        .put(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "Turma de Teste 1 - Atualizada",
          periodo: "2º Semestre",
        });

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe("Turma de Teste 1 - Atualizada");
      expect(res.body.periodo).toBe("2º Semestre");
    });

    it("deve atualizar turma com sucesso (COORDENADOR)", async () => {
      const res = await request(app)
        .put(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${coordenadorToken}`)
        .send({
          ativo: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.ativo).toBe(false);
    });

    it("deve retornar erro 403 ao tentar atualizar (PROFESSOR)", async () => {
      const res = await request(app)
        .put(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${professorToken}`)
        .send({
          nome: "Tentativa de Atualização",
        });

      expect(res.status).toBe(403);
    });

    it("deve retornar erro 404 para turma inexistente", async () => {
      const res = await request(app)
        .put("/api/v1/turmas/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "Turma Inexistente",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/turmas/:id", () => {
    it("deve retornar erro 403 ao tentar deletar (COORDENADOR)", async () => {
      const res = await request(app)
        .delete(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${coordenadorToken}`);

      expect(res.status).toBe(403);
    });

    it("deve deletar turma com sucesso (ADMIN)", async () => {
      const res = await request(app)
        .delete(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it("deve retornar erro 404 ao tentar deletar turma inexistente", async () => {
      const res = await request(app)
        .delete(`/api/v1/turmas/${turmaId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Fluxo completo: criar → listar → obter → atualizar → deletar", () => {
    it("deve completar o fluxo CRUD com sucesso", async () => {
      // Criar
      const createRes = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "Turma Fluxo Completo",
          codigo: "TEST-FLOW",
          anoLetivo: 2025,
          periodo: "Anual",
        });
      expect(createRes.status).toBe(201);
      const id = createRes.body.id;

      // Listar
      const listRes = await request(app)
        .get("/api/v1/turmas")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.some((t: any) => t.id === id)).toBe(true);

      // Obter
      const getRes = await request(app)
        .get(`/api/v1/turmas/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.codigo).toBe("TEST-FLOW");

      // Atualizar
      const updateRes = await request(app)
        .put(`/api/v1/turmas/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ nome: "Turma Fluxo Completo - Modificada" });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.nome).toBe("Turma Fluxo Completo - Modificada");

      // Deletar
      const deleteRes = await request(app)
        .delete(`/api/v1/turmas/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(204);
    });
  });
});
