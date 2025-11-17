import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Relatórios (Integration)", () => {
  let adminToken: string;
  let coordToken: string;
  let profToken: string;
  let profNaoVinculadoToken: string;
  let alunoToken: string;

  let idTurma: string;
  let idAluno1: string;
  let idAluno2: string;
  let idAluno3: string;
  let idAula1: string;
  let idAula2: string;
  let idAula3: string;

  beforeAll(async () => {
    // Limpar dados
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
      nome: "Admin Relatorio",
      email: "admin-relatorio@test.com",
      senha: "senha123",
      role: "ADMIN",
    });
    adminToken = resAdmin.body.token;

    const resCoord = await request(app).post("/api/v1/auth/register").send({
      nome: "Coord Relatorio",
      email: "coord-relatorio@test.com",
      senha: "senha123",
      role: "COORDENADOR",
    });
    coordToken = resCoord.body.token;

    const resProf = await request(app).post("/api/v1/auth/register").send({
      nome: "Prof Relatorio",
      email: "prof-relatorio@test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    profToken = resProf.body.token;

    const resProfNaoVinc = await request(app).post("/api/v1/auth/register").send({
      nome: "Prof Não Vinculado",
      email: "prof-nao-vinc-rel@test.com",
      senha: "senha123",
      role: "PROFESSOR",
    });
    profNaoVinculadoToken = resProfNaoVinc.body.token;

    const resAluno = await request(app).post("/api/v1/auth/register").send({
      nome: "Aluno Relatorio",
      email: "aluno-relatorio@test.com",
      senha: "senha123",
      role: "ALUNO",
    });
    alunoToken = resAluno.body.token;

    // Criar turma
    const resTurma = await request(app)
      .post("/api/v1/turmas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Turma Relatório Test",
        codigo: "REL-TEST-01",
        anoLetivo: 2025,
        periodo: "1º Semestre",
      });
    idTurma = resTurma.body.id;

    // Buscar perfil de professor (já criado automaticamente pelo AuthService) e vincular
    const usuarioProf = await prisma.usuario.findUnique({
      where: { email: "prof-relatorio@test.com" },
    });
    const profCriado = await prisma.professor.findUnique({
      where: { idUsuario: usuarioProf!.id },
    });
    await prisma.turmaProfessor.create({
      data: { idTurma, idProfessor: profCriado!.id },
    });

    // Buscar perfil de professor não vinculado (já criado automaticamente pelo AuthService)
    const usuarioProfNaoVinc = await prisma.usuario.findUnique({
      where: { email: "prof-nao-vinc-rel@test.com" },
    });
    await prisma.professor.findUnique({
      where: { idUsuario: usuarioProfNaoVinc!.id },
    });

    // Criar 3 alunos e matricular
    const usuario1 = await prisma.usuario.create({
      data: {
        nome: "Aluno 100% Presente",
        email: "aluno-presente@test.com",
        senhaHash: "hash",
        role: "ALUNO",
      },
    });
    const aluno1 = await prisma.aluno.create({
      data: { idUsuario: usuario1.id, matricula: "ALU-PRE-001" },
    });
    idAluno1 = aluno1.id;
    await prisma.turmaAluno.create({
      data: { idTurma, idAluno: idAluno1 },
    });

    const usuario2 = await prisma.usuario.create({
      data: {
        nome: "Aluno 100% Ausente",
        email: "aluno-ausente@test.com",
        senhaHash: "hash",
        role: "ALUNO",
      },
    });
    const aluno2 = await prisma.aluno.create({
      data: { idUsuario: usuario2.id, matricula: "ALU-AUS-002" },
    });
    idAluno2 = aluno2.id;
    await prisma.turmaAluno.create({
      data: { idTurma, idAluno: idAluno2 },
    });

    const usuario3 = await prisma.usuario.create({
      data: {
        nome: "Aluno Mix",
        email: "aluno-mix@test.com",
        senhaHash: "hash",
        role: "ALUNO",
      },
    });
    const aluno3 = await prisma.aluno.create({
      data: { idUsuario: usuario3.id, matricula: "ALU-MIX-003" },
    });
    idAluno3 = aluno3.id;
    await prisma.turmaAluno.create({
      data: { idTurma, idAluno: idAluno3 },
    });

    // Criar 3 aulas
    const aula1 = await prisma.aula.create({
      data: {
        idTurma,
        titulo: "Aula 1",
        dataAula: new Date("2025-06-10T10:00:00Z"),
      },
    });
    idAula1 = aula1.id;

    const aula2 = await prisma.aula.create({
      data: {
        idTurma,
        titulo: "Aula 2",
        dataAula: new Date("2025-06-15T10:00:00Z"),
      },
    });
    idAula2 = aula2.id;

    const aula3 = await prisma.aula.create({
      data: {
        idTurma,
        titulo: "Aula 3",
        dataAula: new Date("2025-06-20T10:00:00Z"),
      },
    });
    idAula3 = aula3.id;

    // Marcar presenças
    // Aluno 1: 100% presente (3/3)
    await prisma.presenca.create({
      data: { idAula: idAula1, idAluno: idAluno1, status: "PRESENTE" },
    });
    await prisma.presenca.create({
      data: { idAula: idAula2, idAluno: idAluno1, status: "PRESENTE" },
    });
    await prisma.presenca.create({
      data: { idAula: idAula3, idAluno: idAluno1, status: "PRESENTE" },
    });

    // Aluno 2: 100% ausente (3/3)
    await prisma.presenca.create({
      data: { idAula: idAula1, idAluno: idAluno2, status: "AUSENTE" },
    });
    await prisma.presenca.create({
      data: { idAula: idAula2, idAluno: idAluno2, status: "AUSENTE" },
    });
    await prisma.presenca.create({
      data: { idAula: idAula3, idAluno: idAluno2, status: "AUSENTE" },
    });

    // Aluno 3: 1 presente, 1 atraso, 1 justificada
    await prisma.presenca.create({
      data: { idAula: idAula1, idAluno: idAluno3, status: "PRESENTE" },
    });
    await prisma.presenca.create({
      data: { idAula: idAula2, idAluno: idAluno3, status: "ATRASO" },
    });
    await prisma.presenca.create({
      data: { idAula: idAula3, idAluno: idAluno3, status: "JUSTIFICADA" },
    });
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

  describe("GET /turmas/:id/presencas/relatorio", () => {
    it("deve gerar relatório (ADMIN)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("turma");
      expect(res.body).toHaveProperty("periodo");
      expect(res.body).toHaveProperty("totalAulas");
      expect(res.body).toHaveProperty("alunos");
      expect(res.body.totalAulas).toBe(3);
      expect(res.body.alunos).toHaveLength(3);
    });

    it("deve gerar relatório (COORDENADOR)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${coordToken}`);

      expect(res.status).toBe(200);
      expect(res.body.alunos).toHaveLength(3);
    });

    it("deve gerar relatório (PROFESSOR vinculado)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${profToken}`);

      expect(res.status).toBe(200);
      expect(res.body.alunos).toHaveLength(3);
    });

    it("deve negar (PROFESSOR não vinculado → 403)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${profNaoVinculadoToken}`);

      expect(res.status).toBe(403);
    });

    it("deve negar (ALUNO → 403)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${alunoToken}`);

      expect(res.status).toBe(403);
    });

    it("deve calcular 100% presença corretamente", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${adminToken}`);

      const alunoPresente = res.body.alunos.find(
        (a: any) => a.matricula === "ALU-PRE-001"
      );
      expect(alunoPresente.estatisticas.presente).toBe(3);
      expect(alunoPresente.estatisticas.percentualPresenca).toBe(100);
      expect(alunoPresente.estatisticas.percentualAusencia).toBe(0);
    });

    it("deve calcular 100% ausência corretamente", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${adminToken}`);

      const alunoAusente = res.body.alunos.find(
        (a: any) => a.matricula === "ALU-AUS-002"
      );
      expect(alunoAusente.estatisticas.ausente).toBe(3);
      expect(alunoAusente.estatisticas.percentualPresenca).toBe(0);
      expect(alunoAusente.estatisticas.percentualAusencia).toBe(100);
    });

    it("deve calcular mix de status corretamente", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${adminToken}`);

      const alunoMix = res.body.alunos.find((a: any) => a.matricula === "ALU-MIX-003");
      expect(alunoMix.estatisticas.presente).toBe(1);
      expect(alunoMix.estatisticas.atraso).toBe(1);
      expect(alunoMix.estatisticas.justificada).toBe(1);
      expect(alunoMix.estatisticas.ausente).toBe(0);
      // (presente + atraso) / total = (1+1)/3 = 66.67%
      expect(alunoMix.estatisticas.percentualPresenca).toBeCloseTo(66.67, 1);
    });

    it("deve filtrar por período (de/ate)", async () => {
      // Apenas aulas entre 2025-06-12 e 2025-06-18 (só aula2)
      const res = await request(app)
        .get(
          `/api/v1/turmas/${idTurma}/presencas/relatorio?de=2025-06-12T00:00:00Z&ate=2025-06-18T23:59:59Z`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalAulas).toBe(1); // Apenas aula 2
      expect(res.body.periodo.de).toBeTruthy();
      expect(res.body.periodo.ate).toBeTruthy();
    });

    it("deve ordenar por percentual de presença (decrescente)", async () => {
      const res = await request(app)
        .get(`/api/v1/turmas/${idTurma}/presencas/relatorio`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const alunos = res.body.alunos;

      // Primeiro deve ser 100% presente, último 100% ausente
      expect(alunos[0].estatisticas.percentualPresenca).toBe(100);
      expect(alunos[alunos.length - 1].estatisticas.percentualPresenca).toBe(0);

      // Verificar ordenação decrescente
      for (let i = 1; i < alunos.length; i++) {
        expect(alunos[i - 1].estatisticas.percentualPresenca).toBeGreaterThanOrEqual(
          alunos[i].estatisticas.percentualPresenca
        );
      }
    });

    it("deve retornar 404 para turma inexistente", async () => {
      const res = await request(app)
        .get("/api/v1/turmas/00000000-0000-0000-0000-000000000000/presencas/relatorio")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("deve retornar 400 para período inválido (ate < de)", async () => {
      const res = await request(app)
        .get(
          `/api/v1/turmas/${idTurma}/presencas/relatorio?de=2025-06-20T00:00:00Z&ate=2025-06-10T00:00:00Z`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });
});
