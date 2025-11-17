// src/db/seed.ts
import { prisma } from "./prisma.js";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger.js";

async function seed() {
  try {
    logger.info("🌱 Iniciando seed do banco de dados...");

    // 1. Criar usuário ADMIN
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.usuario.upsert({
      where: { email: "admin@chamadaweb.com" },
      update: {},
      create: {
        nome: "Administrador",
        email: "admin@chamadaweb.com",
        senhaHash: adminPassword,
        role: "ADMIN",
        ativo: true,
      },
    });
    logger.info(`✅ Usuário ADMIN criado: ${admin.email}`);

    // 2. Criar usuário COORDENADOR
    const coordPassword = await bcrypt.hash("coord123", 10);
    const coordenador = await prisma.usuario.upsert({
      where: { email: "coord@chamadaweb.com" },
      update: {},
      create: {
        nome: "Coordenador Demo",
        email: "coord@chamadaweb.com",
        senhaHash: coordPassword,
        role: "COORDENADOR",
        ativo: true,
      },
    });
    logger.info(`✅ Usuário COORDENADOR criado: ${coordenador.email}`);

    // 3. Criar usuário PROFESSOR
    const profPassword = await bcrypt.hash("prof123", 10);
    const usuarioProfessor = await prisma.usuario.upsert({
      where: { email: "professor@chamadaweb.com" },
      update: {},
      create: {
        nome: "Professor Demo",
        email: "professor@chamadaweb.com",
        senhaHash: profPassword,
        role: "PROFESSOR",
        ativo: true,
      },
    });

    const professor = await prisma.professor.upsert({
      where: { idUsuario: usuarioProfessor.id },
      update: {},
      create: {
        idUsuario: usuarioProfessor.id,
        apelido: "Prof. Demo",
      },
    });
    logger.info(`✅ Professor criado: ${usuarioProfessor.email}`);

    // 4. Criar usuários ALUNO
    const aluno1Password = await bcrypt.hash("aluno123", 10);
    const usuarioAluno1 = await prisma.usuario.upsert({
      where: { email: "aluno1@chamadaweb.com" },
      update: {},
      create: {
        nome: "João Silva",
        email: "aluno1@chamadaweb.com",
        senhaHash: aluno1Password,
        role: "ALUNO",
        ativo: true,
      },
    });

    const aluno1 = await prisma.aluno.upsert({
      where: { idUsuario: usuarioAluno1.id },
      update: {},
      create: {
        idUsuario: usuarioAluno1.id,
        matricula: "2024001",
        nascimento: new Date("2005-03-15"),
      },
    });
    logger.info(`✅ Aluno criado: ${usuarioAluno1.email}`);

    const aluno2Password = await bcrypt.hash("aluno123", 10);
    const usuarioAluno2 = await prisma.usuario.upsert({
      where: { email: "aluno2@chamadaweb.com" },
      update: {},
      create: {
        nome: "Maria Santos",
        email: "aluno2@chamadaweb.com",
        senhaHash: aluno2Password,
        role: "ALUNO",
        ativo: true,
      },
    });

    const aluno2 = await prisma.aluno.upsert({
      where: { idUsuario: usuarioAluno2.id },
      update: {},
      create: {
        idUsuario: usuarioAluno2.id,
        matricula: "2024002",
        nascimento: new Date("2005-07-20"),
      },
    });
    logger.info(`✅ Aluno criado: ${usuarioAluno2.email}`);

    const aluno3Password = await bcrypt.hash("aluno123", 10);
    const usuarioAluno3 = await prisma.usuario.upsert({
      where: { email: "aluno3@chamadaweb.com" },
      update: {},
      create: {
        nome: "Pedro Oliveira",
        email: "aluno3@chamadaweb.com",
        senhaHash: aluno3Password,
        role: "ALUNO",
        ativo: true,
      },
    });

    const aluno3 = await prisma.aluno.upsert({
      where: { idUsuario: usuarioAluno3.id },
      update: {},
      create: {
        idUsuario: usuarioAluno3.id,
        matricula: "2024003",
        nascimento: new Date("2006-01-10"),
      },
    });
    logger.info(`✅ Aluno criado: ${usuarioAluno3.email}`);

    // 5. Criar turma demo
    const turma = await prisma.turma.upsert({
      where: { codigo: "DEMO-2024-1" },
      update: {},
      create: {
        nome: "Turma Demo 2024",
        codigo: "DEMO-2024-1",
        anoLetivo: 2024,
        periodo: "1º Semestre",
        ativo: true,
      },
    });
    logger.info(`✅ Turma criada: ${turma.nome} (${turma.codigo})`);

    // 6. Vincular professor à turma
    await prisma.turmaProfessor.upsert({
      where: {
        idTurma_idProfessor: {
          idTurma: turma.id,
          idProfessor: professor.id,
        },
      },
      update: {},
      create: {
        idTurma: turma.id,
        idProfessor: professor.id,
        papel: "RESPONSAVEL",
      },
    });
    logger.info(`✅ Professor vinculado à turma`);

    // 7. Matricular alunos na turma
    await prisma.turmaAluno.upsert({
      where: {
        idTurma_idAluno: {
          idTurma: turma.id,
          idAluno: aluno1.id,
        },
      },
      update: {},
      create: {
        idTurma: turma.id,
        idAluno: aluno1.id,
      },
    });

    await prisma.turmaAluno.upsert({
      where: {
        idTurma_idAluno: {
          idTurma: turma.id,
          idAluno: aluno2.id,
        },
      },
      update: {},
      create: {
        idTurma: turma.id,
        idAluno: aluno2.id,
      },
    });

    await prisma.turmaAluno.upsert({
      where: {
        idTurma_idAluno: {
          idTurma: turma.id,
          idAluno: aluno3.id,
        },
      },
      update: {},
      create: {
        idTurma: turma.id,
        idAluno: aluno3.id,
      },
    });
    logger.info(`✅ 3 alunos matriculados na turma`);

    // 8. Criar algumas aulas demo
    const aula1 = await prisma.aula.create({
      data: {
        idTurma: turma.id,
        titulo: "Introdução ao Sistema",
        conteudo: "Apresentação do sistema de chamada digital",
        dataAula: new Date("2024-03-01"),
        horaInicio: new Date("2024-03-01T08:00:00"),
        horaFim: new Date("2024-03-01T10:00:00"),
      },
    });

    const aula2 = await prisma.aula.create({
      data: {
        idTurma: turma.id,
        titulo: "Funcionalidades Básicas",
        conteudo: "Como marcar presença e gerar relatórios",
        dataAula: new Date("2024-03-08"),
        horaInicio: new Date("2024-03-08T08:00:00"),
        horaFim: new Date("2024-03-08T10:00:00"),
      },
    });
    logger.info(`✅ 2 aulas criadas`);

    // 9. Marcar algumas presenças
    await prisma.presenca.createMany({
      data: [
        { idAula: aula1.id, idAluno: aluno1.id, status: "PRESENTE" },
        { idAula: aula1.id, idAluno: aluno2.id, status: "PRESENTE" },
        { idAula: aula1.id, idAluno: aluno3.id, status: "ATRASO" },
        { idAula: aula2.id, idAluno: aluno1.id, status: "PRESENTE" },
        { idAula: aula2.id, idAluno: aluno2.id, status: "AUSENTE" },
        { idAula: aula2.id, idAluno: aluno3.id, status: "PRESENTE" },
      ],
      skipDuplicates: true,
    });
    logger.info(`✅ Presenças marcadas para as aulas`);

    logger.info("\n🎉 Seed concluído com sucesso!");
    logger.info("\n📋 Credenciais criadas:");
    logger.info("   ADMIN:       admin@chamadaweb.com / admin123");
    logger.info("   COORDENADOR: coord@chamadaweb.com / coord123");
    logger.info("   PROFESSOR:   professor@chamadaweb.com / prof123");
    logger.info("   ALUNO 1:     aluno1@chamadaweb.com / aluno123");
    logger.info("   ALUNO 2:     aluno2@chamadaweb.com / aluno123");
    logger.info("   ALUNO 3:     aluno3@chamadaweb.com / aluno123");
  } catch (error) {
    logger.error({ err: error }, "❌ Erro durante o seed");
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    logger.error({ err: error }, "Falha ao executar seed");
    process.exit(1);
  });
