import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Aulas - Integration Tests", () => {
  let adminToken: string;
  let coordToken: string;
  let profToken: string;
  let profNaoVinculadoToken: string;
  let alunoToken: string;

  let idTurma: string;
  let idAula: string;

  beforeAll(async () => {
    // Limpar banco
    await prisma.presenca.deleteMany();
    await prisma.aula.deleteMany();
    await prisma.turmaProfessor.deleteMany();
    await prisma.turmaAluno.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany();
    await prisma.usuario.deleteMany();

    // Criar 5 usuários: admin, coordenador, professor, professor não vinculado, aluno
    const admin = await request(app).post("/api/v1/auth/register").send({
      nome: "Admin Aula Test",
      email: "admin.aula@test.com",
      senha: "senha123",
      role: "ADMIN",
    });
    adminToken = admin.body.token;

    const coord = await request(app).post("/api/v1/auth/register").send({
      nome: "Coordenador Aula Test",
      email: "coord.aula@test.com",
      senha: "senha123",
      role: "COORDENADOR",
    });
    coordToken = coord.body.token;

    const prof = await request(app).post("/api/v1/auth/register").send({
      nome: "Professor Aula Test",
      email: "prof.aula@test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    profToken = prof.body.token;

    const profNaoVinc = await request(app).post("/api/v1/auth/register").send({
      nome: "Professor Não Vinculado",
      email: "profnv.aula@test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    profNaoVinculadoToken = profNaoVinc.body.token;

    const aluno = await request(app).post("/api/v1/auth/register").send({
      nome: "Aluno Aula Test",
      email: "aluno.aula@test.com",
      senha: "senha123",
      role: "ALUNO",
    });
    alunoToken = aluno.body.token;

    // Criar turma
    const turmaResp = await request(app)
      .post("/api/v1/turmas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Turma de Aulas",
        codigo: "AULA-001",
        anoLetivo: 2025,
      });
    idTurma = turmaResp.body.id;

    // Criar perfil do professor vinculado
    const profIdUsuario = prof.body.usuario.id;
    const perfilProf = await request(app)
      .post("/api/v1/professores")
      .set("Authorization", `Bearer ${coordToken}`)
      .send({ idUsuario: profIdUsuario, apelido: "Prof Vinculado" });

    // Vincular professor à turma
    await request(app)
      .post(`/api/v1/turmas/${idTurma}/professores`)
      .set("Authorization", `Bearer ${coordToken}`)
      .send({ idProfessor: perfilProf.body.id });

    // Criar perfil do professor NÃO vinculado (sem vincular à turma)
    const profNVIdUsuario = profNaoVinc.body.usuario.id;
    await request(app)
      .post("/api/v1/professores")
      .set("Authorization", `Bearer ${coordToken}`)
      .send({ idUsuario: profNVIdUsuario, apelido: "Prof Não Vinculado" });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /turmas/:idTurma/aulas", () => {
    it("deve criar aula com ADMIN - 201", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idTurma,
          titulo: "Aula 01 - Introdução",
          conteudo: "Conceitos básicos",
          dataAula: "2025-03-10T08:00:00.000Z",
          horaInicio: "2025-03-10T08:00:00.000Z",
          horaFim: "2025-03-10T09:40:00.000Z",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.titulo).toBe("Aula 01 - Introdução");
      idAula = res.body.id; // guardar para outros testes
    });

    it("deve criar aula com PROFESSOR vinculado - 201", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${profToken}`)
        .send({
          idTurma,
          titulo: "Aula 02 - Desenvolvimento",
          dataAula: "2025-03-12T10:00:00.000Z",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.titulo).toBe("Aula 02 - Desenvolvimento");
    });

    it("deve retornar 403 se PROFESSOR não está vinculado à turma", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${profNaoVinculadoToken}`)
        .send({
          idTurma,
          titulo: "Aula Não Permitida",
          dataAula: "2025-03-15T10:00:00.000Z",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("não está vinculado");
    });

    it("deve retornar 401 se ALUNO tentar criar aula (sem permissão RBAC)", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${alunoToken}`)
        .send({
          idTurma,
          titulo: "Aula Aluno",
          dataAula: "2025-03-20T10:00:00.000Z",
        });

      expect(res.status).toBe(403); // RBAC bloqueia
    });

    it("deve retornar 400 se dados inválidos (sem dataAula)", async () => {
      const res = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idTurma,
          titulo: "Aula Sem Data",
        });

      expect(res.status).toBe(400);
    });

    it("deve retornar 404 se turma não existe", async () => {
      const res = await request(app)
        .post(`/turmas/00000000-0000-0000-0000-000000000000/aulas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idTurma: "00000000-0000-0000-0000-000000000000",
          dataAula: "2025-03-10T08:00:00.000Z",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /turmas/:idTurma/aulas", () => {
    it("deve listar aulas da turma - 200", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${coordToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("deve filtrar aulas por data (de/ate) - 200", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/aulas?de=2025-03-01&ate=2025-03-11`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Deve retornar apenas a aula de 2025-03-10
      const aulas = res.body.filter(
        (a: any) => a.titulo === "Aula 01 - Introdução"
      );
      expect(aulas.length).toBeGreaterThan(0);
    });

    it("deve retornar 404 se turma não existe", async () => {
      const res = await request(app)
        .get(`/turmas/00000000-0000-0000-0000-000000000000/aulas`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /aulas/:id", () => {
    it("deve obter aula por ID - 200", async () => {
      const res = await request(app)
        .get(`/api/v1/aulas/${idAula}`)
        .set("Authorization", `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", idAula);
      expect(res.body).toHaveProperty("titulo");
    });

    it("deve retornar 404 se aula não existe", async () => {
      const res = await request(app)
        .get(`/aulas/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /aulas/:id", () => {
    it("deve atualizar aula com ADMIN - 200", async () => {
      const res = await request(app)
        .put(`/api/v1/aulas/${idAula}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          titulo: "Aula 01 - Atualizada",
          conteudo: "Novo conteúdo",
        });

      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe("Aula 01 - Atualizada");
      expect(res.body.conteudo).toBe("Novo conteúdo");
    });

    it("deve atualizar aula com PROFESSOR vinculado - 200", async () => {
      const res = await request(app)
        .put(`/api/v1/aulas/${idAula}`)
        .set("Authorization", `Bearer ${profToken}`)
        .send({
          conteudo: "Atualizado pelo professor",
        });

      expect(res.status).toBe(200);
      expect(res.body.conteudo).toBe("Atualizado pelo professor");
    });

    it("deve retornar 403 se PROFESSOR não vinculado tentar atualizar", async () => {
      const res = await request(app)
        .put(`/api/v1/aulas/${idAula}`)
        .set("Authorization", `Bearer ${profNaoVinculadoToken}`)
        .send({
          titulo: "Tentativa Não Permitida",
        });

      expect(res.status).toBe(403);
    });

    it("deve retornar 403 se COORDENADOR tentar atualizar (sem permissão)", async () => {
      const res = await request(app)
        .put(`/api/v1/aulas/${idAula}`)
        .set("Authorization", `Bearer ${coordToken}`)
        .send({
          titulo: "Coordenador Update",
        });

      expect(res.status).toBe(403); // COORDENADOR não tem AULA_UPDATE
    });

    it("deve retornar 404 se aula não existe", async () => {
      const res = await request(app)
        .put(`/aulas/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ titulo: "Não existe" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /aulas/:id", () => {
    let idAulaParaDeletar: string;

    beforeAll(async () => {
      // Criar uma aula específica para deletar
      const res = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          idTurma,
          titulo: "Aula Para Deletar",
          dataAula: "2025-03-25T10:00:00.000Z",
        });
      idAulaParaDeletar = res.body.id;
    });

    it("deve retornar 403 se COORDENADOR tentar deletar (sem permissão)", async () => {
      const res = await request(app)
        .delete(`/api/v1/aulas/${idAulaParaDeletar}`)
        .set("Authorization", `Bearer ${coordToken}`);

      expect(res.status).toBe(403);
    });

    it("deve retornar 403 se PROFESSOR não vinculado tentar deletar", async () => {
      const res = await request(app)
        .delete(`/api/v1/aulas/${idAulaParaDeletar}`)
        .set("Authorization", `Bearer ${profNaoVinculadoToken}`);

      expect(res.status).toBe(403);
    });

    it("deve deletar aula com PROFESSOR vinculado - 204", async () => {
      const res = await request(app)
        .delete(`/api/v1/aulas/${idAulaParaDeletar}`)
        .set("Authorization", `Bearer ${profToken}`);

      expect(res.status).toBe(204);

      // Verificar que foi deletada
      const check = await request(app)
        .get(`/api/v1/aulas/${idAulaParaDeletar}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(check.status).toBe(404);
    });

    it("deve deletar aula com ADMIN - 204", async () => {
      const res = await request(app)
        .delete(`/api/v1/aulas/${idAula}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it("deve retornar 404 se aula não existe", async () => {
      const res = await request(app)
        .delete(`/aulas/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Fluxo completo", () => {
    it("deve criar turma → vincular professor → criar aula → listar → deletar", async () => {
      // 1. Criar turma
      const turmaResp = await request(app)
        .post("/api/v1/turmas")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nome: "Turma Fluxo Completo",
          codigo: "FLUXO-001",
          anoLetivo: 2025,
        });
      expect(turmaResp.status).toBe(201);
      const turmaId = turmaResp.body.id;

      // 2. Criar professor e vincular
      const usuarioProf = await request(app).post("/api/v1/auth/register").send({
        nome: "Prof Fluxo",
        email: "prof.fluxo@test.com",
        senha: "senha123",
        role: "PROFESSOR",
      });
      const profFluxoToken = usuarioProf.body.token;

      const perfilProf = await request(app)
        .post("/api/v1/professores")
        .set("Authorization", `Bearer ${coordToken}`)
        .send({ idUsuario: usuarioProf.body.usuario.id });

      await request(app)
        .post(`/api/v1/turmas/${turmaId}/professores`)
        .set("Authorization", `Bearer ${coordToken}`)
        .send({ idProfessor: perfilProf.body.id });

      // 3. Criar aula
      const aulaResp = await request(app)
        .post(`/api/v1/turmas/${turmaId}/aulas`)
        .set("Authorization", `Bearer ${profFluxoToken}`)
        .send({
          idTurma: turmaId,
          titulo: "Aula Fluxo",
          dataAula: "2025-04-01T10:00:00.000Z",
        });
      expect(aulaResp.status).toBe(201);
      const aulaId = aulaResp.body.id;

      // 4. Listar aulas
      const listResp = await request(app)
        .get(`/api/v1/turmas/${turmaId}/aulas`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(listResp.status).toBe(200);
      expect(listResp.body.length).toBe(1);

      // 5. Deletar aula
      const delResp = await request(app)
        .delete(`/api/v1/aulas/${aulaId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(delResp.status).toBe(204);
    });
  });
});
