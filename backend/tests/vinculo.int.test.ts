import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Vínculos Integration Tests", () => {
  let adminToken: string;
  let coordenadorToken: string;
  let professorToken: string;
  let turmaId: string;
  let usuarioAlunoId: string;
  let usuarioProfessorId: string;
  let alunoId: string;
  let professorId: string;

  beforeAll(async () => {
    // Limpar dados de teste
    await prisma.turmaAluno.deleteMany({});
    await prisma.turmaProfessor.deleteMany({});
    await prisma.aluno.deleteMany({
      where: { usuario: { email: { contains: "@vinculo-test.com" } } },
    });
    await prisma.professor.deleteMany({
      where: { usuario: { email: { contains: "@vinculo-test.com" } } },
    });
    await prisma.turma.deleteMany({
      where: { codigo: { startsWith: "VINC-" } },
    });
    await prisma.usuario.deleteMany({
      where: { email: { contains: "@vinculo-test.com" } },
    });

    // Criar usuário ADMIN
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      nome: "Admin Vinculo",
      email: "admin@vinculo-test.com",
      senha: "senha123",
      role: "ADMIN",
    });
    adminToken = adminRes.body.token;

    // Criar usuário COORDENADOR
    const coordRes = await request(app).post("/api/v1/auth/register").send({
      nome: "Coordenador Vinculo",
      email: "coord@vinculo-test.com",
      senha: "senha123",
      role: "COORDENADOR",
    });
    coordenadorToken = coordRes.body.token;

    // Criar usuário PROFESSOR (para testes de permissão)
    const profRes = await request(app).post("/api/v1/auth/register").send({
      nome: "Professor Vinculo",
      email: "prof@vinculo-test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    professorToken = profRes.body.token;

    // Criar usuário para perfil ALUNO
    const alunoUserRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        nome: "Aluno Teste",
        email: "aluno@vinculo-test.com",
        senha: "senha123",
        role: "ALUNO",
      });
    usuarioAlunoId = alunoUserRes.body.usuario.id;

    // Criar usuário para perfil PROFESSOR
    const profUserRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        nome: "Professor Teste",
        email: "professor@vinculo-test.com",
        senha: "senha123",
        role: "PROFESSOR",
      });
    usuarioProfessorId = profUserRes.body.usuario.id;

    // Criar uma turma
    const turmaRes = await request(app)
      .post("/api/v1/turmas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Turma Vínculos Test",
        codigo: "VINC-001",
        anoLetivo: 2025,
      });
    turmaId = turmaRes.body.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.turmaAluno.deleteMany({});
    await prisma.turmaProfessor.deleteMany({});
    await prisma.aluno.deleteMany({
      where: { usuario: { email: { contains: "@vinculo-test.com" } } },
    });
    await prisma.professor.deleteMany({
      where: { usuario: { email: { contains: "@vinculo-test.com" } } },
    });
    await prisma.turma.deleteMany({
      where: { codigo: { startsWith: "VINC-" } },
    });
    await prisma.usuario.deleteMany({
      where: { email: { contains: "@vinculo-test.com" } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/v1/alunos - Criar perfil de aluno", () => {
    it("deve criar perfil de aluno com sucesso (ADMIN)", async () => {
      const res = await request(app)
        .post("/api/v1/alunos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idUsuario: usuarioAlunoId,
          matricula: "2025001",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.idUsuario).toBe(usuarioAlunoId);
      expect(res.body.matricula).toBe("2025001");
      alunoId = res.body.id;
    });

    it("deve retornar erro 409 ao tentar criar perfil duplicado", async () => {
      const res = await request(app)
        .post("/api/v1/alunos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idUsuario: usuarioAlunoId,
          matricula: "2025002",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("já possui perfil");
    });

    it("deve retornar erro 400 com role inválida", async () => {
      // Criar usuário com role PROFESSOR
      const userRes = await request(app).post("/api/v1/auth/register").send({
        nome: "Usuario Errado",
        email: "errado@vinculo-test.com",
        senha: "senha123",
        role: "PROFESSOR",
      });

      const res = await request(app)
        .post("/api/v1/alunos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idUsuario: userRes.body.usuario.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("role ALUNO");
    });

    it("deve retornar erro 403 sem permissão (PROFESSOR)", async () => {
      const res = await request(app)
        .post("/api/v1/alunos")
        .set("Authorization", `Bearer ${professorToken}`)
        .send({
          idUsuario: usuarioAlunoId,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/professores - Criar perfil de professor", () => {
    it("deve criar perfil de professor com sucesso (COORDENADOR)", async () => {
      const res = await request(app)
        .post("/api/v1/professores")
        .set("Authorization", `Bearer ${coordenadorToken}`)
        .send({
          idUsuario: usuarioProfessorId,
          apelido: "Prof Teste",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.idUsuario).toBe(usuarioProfessorId);
      expect(res.body.apelido).toBe("Prof Teste");
      professorId = res.body.id;
    });

    it("deve retornar erro 409 ao tentar criar perfil duplicado", async () => {
      const res = await request(app)
        .post("/api/v1/professores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idUsuario: usuarioProfessorId,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("já possui perfil");
    });

    it("deve retornar erro 403 sem permissão (PROFESSOR)", async () => {
      const res = await request(app)
        .post("/api/v1/professores")
        .set("Authorization", `Bearer ${professorToken}`)
        .send({
          idUsuario: usuarioProfessorId,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/turmas/:id/alunos - Matricular aluno", () => {
    it("deve matricular aluno na turma com sucesso (ADMIN)", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idAluno: alunoId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.idTurma).toBe(turmaId);
      expect(res.body.idAluno).toBe(alunoId);
    });

    it("deve retornar erro 409 ao matricular aluno duplicado", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idAluno: alunoId,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("já matriculado");
    });

    it("deve retornar erro 404 com aluno inexistente", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idAluno: "00000000-0000-0000-0000-000000000000",
        });

      expect(res.status).toBe(404);
    });

    it("deve retornar erro 403 sem permissão (PROFESSOR)", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${professorToken}`)
        .send({
          idAluno: alunoId,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/turmas/:id/professores - Vincular professor", () => {
    it("deve vincular professor à turma com sucesso (COORDENADOR)", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${coordenadorToken}`)
        .send({
          idProfessor: professorId,
          papel: "TITULAR",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.idTurma).toBe(turmaId);
      expect(res.body.idProfessor).toBe(professorId);
      expect(res.body.papel).toBe("TITULAR");
    });

    it("deve retornar erro 409 ao vincular professor duplicado", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idProfessor: professorId,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("já vinculado");
    });

    it("deve retornar erro 404 com professor inexistente", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idProfessor: "00000000-0000-0000-0000-000000000000",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/turmas/:id/alunos - Listar alunos da turma", () => {
    it("deve listar alunos da turma (qualquer autenticado)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${professorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].idAluno).toBe(alunoId);
    });

    it("deve retornar erro 401 sem token", async () => {
      const res = await request(app).get(`/api/v1/turmas/${turmaId}/alunos`);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/turmas/:id/professores - Listar professores da turma", () => {
    it("deve listar professores da turma (qualquer autenticado)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${professorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].idProfessor).toBe(professorId);
    });
  });

  describe("Fluxo completo: criar perfis → matricular/vincular → listar → remover", () => {
    it("deve completar o fluxo de vínculos com sucesso", async () => {
      // Criar usuários
      const alunoUserRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          nome: "Aluno Fluxo",
          email: "aluno-fluxo@vinculo-test.com",
          senha: "senha123",
          role: "ALUNO",
        });

      const profUserRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          nome: "Professor Fluxo",
          email: "prof-fluxo@vinculo-test.com",
          senha: "senha123",
          role: "PROFESSOR",
        });

      // Criar perfis
      const alunoRes = await request(app)
        .post("/api/v1/alunos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idUsuario: alunoUserRes.body.usuario.id,
          matricula: "FLUXO-001",
        });

      const profRes = await request(app)
        .post("/api/v1/professores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idUsuario: profUserRes.body.usuario.id,
          apelido: "Prof Fluxo",
        });

      expect(alunoRes.status).toBe(201);
      expect(profRes.status).toBe(201);

      const alunoFluxoId = alunoRes.body.id;
      const profFluxoId = profRes.body.id;

      // Matricular e vincular
      const matriculaRes = await request(app)
        .post(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ idAluno: alunoFluxoId });

      const vinculoRes = await request(app)
        .post(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ idProfessor: profFluxoId });

      expect(matriculaRes.status).toBe(201);
      expect(vinculoRes.status).toBe(201);

      // Listar
      const listarAlunosRes = await request(app)
        .get(`/api/v1/turmas/${turmaId}/alunos`)
        .set("Authorization", `Bearer ${adminToken}`);

      const listarProfsRes = await request(app)
        .get(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listarAlunosRes.status).toBe(200);
      expect(
        listarAlunosRes.body.some((a: any) => a.idAluno === alunoFluxoId)
      ).toBe(true);

      expect(listarProfsRes.status).toBe(200);
      expect(
        listarProfsRes.body.some((p: any) => p.idProfessor === profFluxoId)
      ).toBe(true);

      // Remover vínculos
      const removerMatriculaRes = await request(app)
        .delete(`/api/v1/turmas/${turmaId}/alunos/${alunoFluxoId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      const removerVinculoRes = await request(app)
        .delete(`/api/v1/turmas/${turmaId}/professores/${profFluxoId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(removerMatriculaRes.status).toBe(204);
      expect(removerVinculoRes.status).toBe(204);
    });
  });
});
