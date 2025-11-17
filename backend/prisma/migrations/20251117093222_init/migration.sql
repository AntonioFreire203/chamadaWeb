-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROFESSOR', 'COORDENADOR', 'ALUNO');

-- CreateEnum
CREATE TYPE "StatusPresenca" AS ENUM ('PRESENTE', 'AUSENTE', 'ATRASO', 'JUSTIFICADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "matricula" TEXT,
    "nascimento" TIMESTAMP(3),

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "apelido" TEXT,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "anoLetivo" INTEGER NOT NULL,
    "periodo" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaAluno" (
    "id" TEXT NOT NULL,
    "idTurma" TEXT NOT NULL,
    "idAluno" TEXT NOT NULL,
    "entrada" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurmaAluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaProfessor" (
    "id" TEXT NOT NULL,
    "idTurma" TEXT NOT NULL,
    "idProfessor" TEXT NOT NULL,
    "papel" TEXT DEFAULT 'RESPONSAVEL',

    CONSTRAINT "TurmaProfessor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL,
    "idTurma" TEXT NOT NULL,
    "titulo" TEXT,
    "conteudo" TEXT,
    "dataAula" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3),
    "horaFim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "idAula" TEXT NOT NULL,
    "idAluno" TEXT NOT NULL,
    "status" "StatusPresenca" NOT NULL,
    "observacao" TEXT,
    "marcadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_idUsuario_key" ON "Aluno"("idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_idUsuario_key" ON "Professor"("idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Turma_codigo_key" ON "Turma"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TurmaAluno_idTurma_idAluno_key" ON "TurmaAluno"("idTurma", "idAluno");

-- CreateIndex
CREATE UNIQUE INDEX "TurmaProfessor_idTurma_idProfessor_key" ON "TurmaProfessor"("idTurma", "idProfessor");

-- CreateIndex
CREATE INDEX "Aula_idTurma_dataAula_idx" ON "Aula"("idTurma", "dataAula");

-- CreateIndex
CREATE INDEX "Presenca_idAula_idx" ON "Presenca"("idAula");

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_idAula_idAluno_key" ON "Presenca"("idAula", "idAluno");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaAluno" ADD CONSTRAINT "TurmaAluno_idTurma_fkey" FOREIGN KEY ("idTurma") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaAluno" ADD CONSTRAINT "TurmaAluno_idAluno_fkey" FOREIGN KEY ("idAluno") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaProfessor" ADD CONSTRAINT "TurmaProfessor_idTurma_fkey" FOREIGN KEY ("idTurma") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaProfessor" ADD CONSTRAINT "TurmaProfessor_idProfessor_fkey" FOREIGN KEY ("idProfessor") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_idTurma_fkey" FOREIGN KEY ("idTurma") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_idAula_fkey" FOREIGN KEY ("idAula") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_idAluno_fkey" FOREIGN KEY ("idAluno") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;
