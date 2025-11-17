import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Presenças (Integration)", () => {
  let adminToken: string;
  let profToken: string;
  let profNaoVinculadoToken: string;
  let coordToken: string;
  let alunoToken: string;

  let idTurma: string;
  let idAula: string;
  let idAluno1: string;
  let idAluno2: string;
  let idAlunoNaoMatriculado: string;

  beforeAll(async () => {
    // Limpar dados antes de começar
    await prisma.presenca.deleteMany();
    await prisma.aula.deleteMany();
    await prisma.turmaProfessor.deleteMany();
    await prisma.turmaAluno.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany();
    await prisma.usuario.deleteMany();

    // Criar usuários
    const resAdmin = await request(app).post("/api/v1/auth/register").send({
      nome: "Admin Test",
      email: "admin-presenca@test.com",
      senha: "senha123",
      role: "ADMIN",
    });
    adminToken = resAdmin.body.token;

    const resProf = await request(app).post("/api/v1/auth/register").send({
      nome: "Prof Test",
      email: "prof-presenca@test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    profToken = resProf.body.token;

    const resProfNaoVinc = await request(app).post("/api/v1/auth/register").send({
      nome: "Prof Não Vinc",
      email: "prof-nao-vinc-presenca@test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    profNaoVinculadoToken = resProfNaoVinc.body.token;

    const resCoord = await request(app).post("/api/v1/auth/register").send({
      nome: "Coord Test",
      email: "coord-presenca@test.com",
      senha: "senha123",
      role: "COORDENADOR",
    });
    coordToken = resCoord.body.token;

    const resAluno = await request(app).post("/api/v1/auth/register").send({
      nome: "Aluno Test",
      email: "aluno-presenca@test.com",
      senha: "senha123",
      role: "ALUNO",
    });
    alunoToken = resAluno.body.token;

    // Criar turma
    const resTurma = await request(app)
      .post("/api/v1/turmas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Turma Presença Test",
        codigo: "PRES-TEST-01",
        anoLetivo: 2025,
        periodo: "1º Semestre",
      });
    
    if (resTurma.status !== 201) {
      throw new Error(`Falha ao criar turma no beforeAll: status ${resTurma.status}`);
    }
    
    idTurma = resTurma.body.id;

    // Criar perfis de professor
    const usuarioProf = await prisma.usuario.findUnique({
      where: { email: "prof-presenca@test.com" },
    });
    const profCriado = await prisma.professor.create({
      data: { idUsuario: usuarioProf!.id },
    });

    const usuarioProfNaoVinc = await prisma.usuario.findUnique({
      where: { email: "prof-nao-vinc-presenca@test.com" },
    });
    await prisma.professor.create({
      data: { idUsuario: usuarioProfNaoVinc!.id },
    });

    // Vincular apenas o professor principal à turma
    await prisma.turmaProfessor.create({
      data: {
        idTurma,
        idProfessor: profCriado.id,
      },
    });

    // Criar perfis de aluno e matricular
    const usuarioAluno1 = await prisma.usuario.create({
      data: {
        nome: "Aluno 1",
        email: "aluno1-presenca@test.com",
        senhaHash: "hash",
        role: "ALUNO",
      },
    });
    const aluno1 = await prisma.aluno.create({
      data: { idUsuario: usuarioAluno1.id, matricula: "ALU001" },
    });
    idAluno1 = aluno1.id;

    await prisma.turmaAluno.create({
      data: { idTurma, idAluno: idAluno1 },
    });

    const usuarioAluno2 = await prisma.usuario.create({
      data: {
        nome: "Aluno 2",
        email: "aluno2-presenca@test.com",
        senhaHash: "hash",
        role: "ALUNO",
      },
    });
    const aluno2 = await prisma.aluno.create({
      data: { idUsuario: usuarioAluno2.id, matricula: "ALU002" },
    });
    idAluno2 = aluno2.id;

    await prisma.turmaAluno.create({
      data: { idTurma, idAluno: idAluno2 },
    });

    // Criar aluno não matriculado
    const usuarioAlunoNaoMat = await prisma.usuario.create({
      data: {
        nome: "Aluno Não Matriculado",
        email: "aluno-nao-mat@test.com",
        senhaHash: "hash",
        role: "ALUNO",
      },
    });
    const alunoNaoMat = await prisma.aluno.create({
      data: { idUsuario: usuarioAlunoNaoMat.id, matricula: "ALU999" },
    });
    idAlunoNaoMatriculado = alunoNaoMat.id;

    // Criar aula
    const resAula = await request(app)
      .post(`/api/v1/turmas/${idTurma}/aulas`)
      .set("Authorization", `Bearer ${profToken}`)
      .send({
        titulo: "Aula 1",
        dataAula: "2025-06-15T10:00:00Z",
      });
    
    if (resAula.status !== 201) {
      throw new Error(`Falha ao criar aula no beforeAll: status ${resAula.status}`);
    }
    
    idAula = resAula.body.id;
  });

  afterAll(async () => {
    await prisma.presenca.deleteMany();
    await prisma.aula.deleteMany();
    await prisma.turmaProfessor.deleteMany();
    await prisma.turmaAluno.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany();
    await prisma.usuario.deleteMany();
  });

  describe("POST /aulas/:id/presencas", () => {
    it("deve marcar presenças (ADMIN)", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [
            { idAluno: idAluno1, status: "PRESENTE" },
            { idAluno: idAluno2, status: "AUSENTE", observacao: "Faltou" },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("sucesso");
      expect(res.body.total).toBe(2);
    });

    it("deve marcar presenças (PROFESSOR vinculado)", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${profToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "ATRASO" }],
        });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
    });

    it("deve negar (PROFESSOR não vinculado → 403)", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${profNaoVinculadoToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "PRESENTE" }],
        });

      expect(res.status).toBe(403);
    });

    it("deve negar (COORDENADOR → 403)", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${coordToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "PRESENTE" }],
        });

      expect(res.status).toBe(403);
    });

    it("deve negar (ALUNO → 403)", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${alunoToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "PRESENTE" }],
        });

      expect(res.status).toBe(403);
    });

    it("deve retornar 400 para array vazio", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ presencas: [] });

      expect(res.status).toBe(400);
    });

    it("deve retornar 400 para status inválido", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "INVALIDO" }],
        });

      expect(res.status).toBe(400);
    });

    it("deve retornar 400 para aluno não matriculado", async () => {
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [{ idAluno: idAlunoNaoMatriculado, status: "PRESENTE" }],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("não matriculados");
    });

    it("deve retornar 404 para aula inexistente", async () => {
      const res = await request(app)
        .post("/api/v1/aulas/00000000-0000-0000-0000-000000000000/presencas")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "PRESENTE" }],
        });

      expect(res.status).toBe(404);
    });

    it("deve atualizar presença existente (upsert)", async () => {
      // Limpar presenças anteriores do idAluno1
      await prisma.presenca.deleteMany({
        where: { idAula, idAluno: idAluno1 },
      });

      // Primeira marcação
      await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "PRESENTE" }],
        });

      // Atualizar para AUSENTE
      const res = await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [{ idAluno: idAluno1, status: "AUSENTE" }],
        });

      expect(res.status).toBe(200);

      // Verificar que não duplicou
      const presencas = await prisma.presenca.findMany({
        where: { idAula, idAluno: idAluno1 },
      });
      expect(presencas).toHaveLength(1);
      expect(presencas[0].status).toBe("AUSENTE");
    });
  });

  describe("GET /aulas/:id/presencas", () => {
    it("deve listar presenças (qualquer autenticado)", async () => {
      // Limpar e marcar presenças primeiro
      await prisma.presenca.deleteMany({ where: { idAula } });
      
      await request(app)
        .post(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          presencas: [
            { idAluno: idAluno1, status: "PRESENTE" },
            { idAluno: idAluno2, status: "AUSENTE" },
          ],
        });

      const res = await request(app)
        .get(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      // Verificar estrutura
      const presenca = res.body[0];
      expect(presenca).toHaveProperty("id");
      expect(presenca).toHaveProperty("status");
      expect(presenca).toHaveProperty("aluno");
      expect(presenca.aluno).toHaveProperty("usuario");
      expect(presenca.aluno.usuario).toHaveProperty("nome");
    });

    it("deve listar ordenado por nome do aluno", async () => {
      const res = await request(app)
        .get(`/api/v1/aulas/${idAula}/presencas`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const nomes = res.body.map((p: any) => p.aluno.usuario.nome);
      const nomesOrdenados = [...nomes].sort();
      expect(nomes).toEqual(nomesOrdenados);
    });

    it("deve retornar 404 para aula inexistente", async () => {
      const res = await request(app)
        .get("/api/v1/aulas/00000000-0000-0000-0000-000000000000/presencas")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("deve negar sem autenticação (401)", async () => {
      const res = await request(app).get(`/api/v1/aulas/${idAula}/presencas`);

      expect(res.status).toBe(401);
    });
  });

  describe("Fluxo completo", () => {
    it("deve criar aula → marcar presenças → listar → atualizar → listar novamente", async () => {
      // Criar nova aula
      const resAula = await request(app)
        .post(`/api/v1/turmas/${idTurma}/aulas`)
        .set("Authorization", `Bearer ${profToken}`)
        .send({
          titulo: "Aula Fluxo Completo",
          dataAula: "2025-06-20T14:00:00Z",
        });
      expect(resAula.status).toBe(201);
      const novaAulaId = resAula.body.id;

      // Marcar presenças inicial
      const resMarcacao1 = await request(app)
        .post(`/api/v1/aulas/${novaAulaId}/presencas`)
        .set("Authorization", `Bearer ${profToken}`)
        .send({
          presencas: [
            { idAluno: idAluno1, status: "AUSENTE" },
            { idAluno: idAluno2, status: "PRESENTE" },
          ],
        });
      expect(resMarcacao1.status).toBe(200);

      // Listar
      const resListagem1 = await request(app)
        .get(`/api/v1/aulas/${novaAulaId}/presencas`)
        .set("Authorization", `Bearer ${profToken}`);
      expect(resListagem1.status).toBe(200);
      expect(resListagem1.body).toHaveLength(2);

      const presenca1 = resListagem1.body.find((p: any) => p.idAluno === idAluno1);
      expect(presenca1.status).toBe("AUSENTE");

      // Atualizar (justificar falta)
      const resMarcacao2 = await request(app)
        .post(`/api/v1/aulas/${novaAulaId}/presencas`)
        .set("Authorization", `Bearer ${profToken}`)
        .send({
          presencas: [
            { idAluno: idAluno1, status: "JUSTIFICADA", observacao: "Atestado médico" },
          ],
        });
      expect(resMarcacao2.status).toBe(200);

      // Listar novamente
      const resListagem2 = await request(app)
        .get(`/api/v1/aulas/${novaAulaId}/presencas`)
        .set("Authorization", `Bearer ${profToken}`);
      expect(resListagem2.status).toBe(200);

      const presenca2 = resListagem2.body.find((p: any) => p.idAluno === idAluno1);
      expect(presenca2.status).toBe("JUSTIFICADA");
      expect(presenca2.observacao).toBe("Atestado médico");

      // Verificar que não duplicou
      const todasPresencas = await prisma.presenca.findMany({
        where: { idAula: novaAulaId },
      });
      expect(todasPresencas).toHaveLength(2); // Apenas 2 alunos
    });
  });
});
