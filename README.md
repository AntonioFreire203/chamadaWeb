#Escopo Técnico – ChamadaWeb (Backend/API)

1) Objetivo

Construir um backend Node.js + Express + TypeScript + PostgreSQL para gestão de turmas, aulas e presenças. Arquitetura MVC expandida: Controllers → Services → Repositórios/Modelos, com UUID em todas as entidades. Entidade de AULA explícita; PRESENCA referencia id_aula (não usar data_aula direto em presença).

2) Entidades (MVP)

1-USUARIO (credenciais, perfis/roles)

2-ALUNO

3-PROFESSOR

4-TURMA

5-AULA (data/hora/assunto vinculado à turma)

6-TURMA_ALUNO (matrícula do aluno na turma)

7-TURMA_PROFESSOR (alocação do professor na turma)

8-PRESENCA (status por aluno em uma AULA)


3) Regras de negócio (MVP)

3.1)Um USUARIO pode ter papéis: ADMIN, PROFESSOR, COODENADOR (opcional), ALUNO (se houver portal).

3.2)AULA só pode ser criada por PROFESSOR da turma ou ADMIN.

3.3)PRESENCA: valores PRESENTE | AUSENTE | ATRASO | JUSTIFICADA + carimbo de hora.

3.4)TURMA_ALUNO impede duplicidade (único por id_turma + id_aluno).

3.5)PRESENCA única por id_aula + id_aluno.

4) Stack & padrões

4.1)Node 20+, Express, TypeScript

4.2)PostgreSQL 14+

4.3)ORM Prisma (ou pg nativo; decidir abaixo)

4.4)Zod para validação de DTOs

4.5)JWT (RS256 ou HS256) + RBAC

4.6)dotenv, pino (logs), helmet, cors

4.7)Testes: Vitest/Jest + Supertest

4.8)Lint/format: ESLint + Prettier

4.9)Doc: OpenAPI 3.0 (Swagger)

5)Estrutura de pastas
chamadaweb/
└─ backend/
   ├─ src/
   │  ├─ app.ts
   │  ├─ server.ts
   │  ├─ config/env.ts
   │  ├─ domain/enums.ts
   │  ├─ dtos/
   │  │  ├─ auth.dto.ts
   │  │  ├─ aula.dto.ts
   │  │  ├─ presenca.dto.ts
   │  │  └─ turma.dto.ts
   │  ├─ middlewares/
   │  │  ├─ auth.ts
   │  │  ├─ rbac.ts
   │  │  └─ validate.ts
   │  ├─ utils/
   │  │  ├─ errors.ts
   │  │  └─ logger.ts
   │  ├─ db/prisma.ts
   │  ├─ repositories/
   │  │  ├─ aula.repo.ts
   │  │  ├─ presenca.repo.ts
   │  │  ├─ turma.repo.ts
   │  │  ├─ turmaAluno.repo.ts
   │  │  └─ usuario.repo.ts
   │  ├─ services/
   │  │  ├─ aula.service.ts
   │  │  ├─ presenca.service.ts
   │  │  ├─ turma.service.ts
   │  │  └─ auth.service.ts
   │  ├─ controllers/
   │  │  ├─ aula.controller.ts
   │  │  ├─ presenca.controller.ts
   │  │  ├─ turma.controller.ts
   │  │  └─ auth.controller.ts
   │  ├─ routes/
   │  │  ├─ index.ts
   │  │  ├─ aula.routes.ts
   │  │  ├─ presenca.routes.ts
   │  │  ├─ turma.routes.ts
   │  │  └─ auth.routes.ts
   │  └─ docs/openapi.yaml
   ├─ prisma/
   │  └─ schema.prisma
   ├─ tests/
   │  ├─ auth.int.test.ts
   │  └─ aula.int.test.ts
   ├─ .env.example
   ├─ docker-compose.yml
   ├─ Dockerfile
   ├─ package.json
   ├─ tsconfig.json
   └─ README.md



6)Modelo de dados (DDL inicial – Postgres)

-- extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USUARIO
CREATE TABLE usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN','PROFESSOR','GESTOR','ALUNO')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ALUNO / PROFESSOR (perfil vinculado a usuario)
CREATE TABLE aluno (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  matricula text UNIQUE,
  data_nascimento date
);

CREATE TABLE professor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  apelido text
);

-- TURMA
CREATE TABLE turma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text UNIQUE,
  ano_letivo int NOT NULL,
  periodo text, -- ex: 2025.1
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Vínculos
CREATE TABLE turma_aluno (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_turma uuid NOT NULL REFERENCES turma(id) ON DELETE CASCADE,
  id_aluno uuid NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
  data_entrada date DEFAULT now(),
  UNIQUE (id_turma, id_aluno)
);

CREATE TABLE turma_professor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_turma uuid NOT NULL REFERENCES turma(id) ON DELETE CASCADE,
  id_professor uuid NOT NULL REFERENCES professor(id) ON DELETE CASCADE,
  papel text DEFAULT 'RESPONSAVEL', -- opcional
  UNIQUE (id_turma, id_professor)
);

-- AULA
CREATE TABLE aula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_turma uuid NOT NULL REFERENCES turma(id) ON DELETE CASCADE,
  titulo text,
  conteudo text,
  data_aula date NOT NULL,
  hora_inicio time,
  hora_fim time,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_aula_turma_data ON aula(id_turma, data_aula);

-- PRESENCA
CREATE TABLE presenca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_aula uuid NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
  id_aluno uuid NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('PRESENTE','AUSENTE','ATRASO','JUSTIFICADA')),
  observacao text,
  marcado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_aula, id_aluno)
);
CREATE INDEX idx_presenca_aula ON presenca(id_aula);


7) Endpoints (v1) – resumo

Auth

POST /api/v1/auth/register (ADMIN)

POST /api/v1/auth/login

GET /api/v1/auth/me (JWT)

Usuários & Perfis

GET /api/v1/usuarios/:id

PATCH /api/v1/usuarios/:id (ADMIN)

POST /api/v1/alunos / POST /api/v1/professores (cria perfil a partir de id_usuario)

Turmas

POST /api/v1/turmas (ADMIN|GESTOR)

GET /api/v1/turmas

GET /api/v1/turmas/:id

POST /api/v1/turmas/:id/alunos (matricular – cria TURMA_ALUNO)

POST /api/v1/turmas/:id/professores

Aulas

POST /api/v1/turmas/:id/aulas (PROFESSOR da turma | ADMIN)

GET /api/v1/turmas/:id/aulas?de=YYYY-MM-DD&ate=YYYY-MM-DD

GET /api/v1/aulas/:id

Presenças

POST /api/v1/aulas/:id/presencas (lista de marcações em batch)

PATCH /api/v1/presencas/:id

GET /api/v1/aulas/:id/presencas

GET /api/v1/turmas/:id/presencas/relatorio?de&ate

8) Segurança e Acesso

JWT em Authorization: Bearer.

RBAC middleware: verifica req.user.role vs rota.

Rate limit básico (ex.: 100 req/15min por IP).

Helmet + CORS configurados.