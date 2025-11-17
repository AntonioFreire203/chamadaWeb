# ChamadaWeb – Backend/API

> Stack: **Node 20 + Express + TypeScript + PostgreSQL + Prisma** · Arquitetura **MVC expandido** (Controllers → Services → Repositórios) · **UUID** em tudo · **AULA** explícita; **PRESENCA** referencia `id_aula`.

---

## Sumário
- [Visão Geral](#visão-geral)
- [Eixos Temáticos (Roadmap de Implementação)](#eixos-temáticos-roadmap-de-implementação)
  - [Eixo 0 — Fundamentos & Infra (baseline)](#eixo-0-—-fundamentos--infra-baseline)
  - [Eixo 1 — Autenticação (JWT) + RBAC](#eixo-1-—-autenticação-jwt--rbac)
  - [Eixo 2 — Turmas (CRUD mínimo)](#eixo-2-—-turmas-crud-mínimo)
  - [Eixo 3 — Perfis & Vínculos (Aluno/Professor ↔ Turma)](#eixo-3-—-perfis--vínculos-alunoprofessor--turma)
  - [Eixo 4 — Aulas (agenda por turma)](#eixo-4-—-aulas-agenda-por-turma)
  - [Eixo 5 — Presenças (marcações em lote)](#eixo-5-—-presenças-marcações-em-lote)
  - [Eixo 6 — Relatórios simples (MVP)](#eixo-6-—-relatórios-simples-mvp)
  - [Eixo 7 — Observabilidade & DevOps (mínimo)](#eixo-7-—-observabilidade--devops-mínimo)
  - [Eixo 8 — Documentação & QA](#eixo-8-—-documentação--qa)
- [Prioridades (MoSCoW)](#prioridades-moscow)
- [Mapa de Endpoints (MVP)](#mapa-de-endpoints-mvp)
- [Critérios de Aceite por Eixo (DoD)](#critérios-de-aceite-por-eixo-dod)
- [Plano de Aprendizagem Paralelo](#plano-de-aprendizagem-paralelo)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Modelo de Dados (DDL Postgres)](#modelo-de-dados-ddl-postgres)
- [Scripts & Execução](#scripts--execução)
- [Mensagens de Commit (sugestões)](#mensagens-de-commit-sugestões)
- [Observações de Modelagem](#observações-de-modelagem)

---

## Visão Geral
Construir um backend **Node.js + Express + TypeScript + PostgreSQL** para gestão de **turmas, aulas e presenças**. Arquitetura **MVC expandida**, validação com **Zod**, **JWT + RBAC**, documentação **OpenAPI** e migrações com **Prisma**.

**Entidades (MVP):** `USUARIO`, `ALUNO`, `PROFESSOR`, `TURMA`, `AULA`, `TURMA_ALUNO`, `TURMA_PROFESSOR`, `PRESENCA` (referencia `id_aula`).

---

## Eixos Temáticos (Roadmap de Implementação)

### Eixo 0 — Fundamentos & Infra (baseline)
**Objetivo:** ter API “no ar” com saúde, configs e banco prontos.  
**Por que primeiro:** tudo o resto depende de runtime, env e DB.

**Entregáveis**
- Endpoint `/health` respondendo `200`.
- `.env.example` e `src/config/env.ts` (API_PREFIX, PORT, JWT_SECRET, DATABASE_URL).
- `docker-compose.yml` com Postgres.
- `prisma/schema.prisma` (MVP) + `migrate dev`.

**Testes (smoke)**
- GET `/health` → 200.

**Commit**
```
feat(core): baseline Express + env + docker-compose + Prisma schema e migração
```

---

### Eixo 1 — Autenticação (JWT) + RBAC
**Objetivo:** criar/entrar usuário e proteger rotas com papéis (`ADMIN`, `PROFESSOR`, `Coordenador`, `ALUNO`).  
**Por que agora:** reduz risco de rotas abertas; permite iterar seguro no resto.

**Entregáveis**
- DTOs: `registerDTO`, `loginDTO`.
- Service: `AuthService` (bcrypt + jwt).
- Middlewares: `auth` (JWT), `rbacPermit(action)` com matriz de ações.
- Rotas: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.

**Testes**
- register → login → me (Bearer).  
- rota protegida nega sem token e permite com token.

**Commit**
```
feat(auth): register/login/me + JWT + RBAC por ação
```

---

### Eixo 2 — Turmas (CRUD mínimo)
**Objetivo:** cadastrar turmas e listar/obter.  
**Por que agora:** base para aulas e presenças.

**Entregáveis**
- DTO: `criarTurmaDTO`.
- Rotas:
  - `POST /turmas` (ADMIN|Coordenador)
  - `GET /turmas`, `GET /turmas/:id` (qualquer autenticado)
- Regras: `codigo` único, `anoLetivo` obrigatório.

**Testes**
- cria turma (ADMIN), lista, obtém por id.

**Commit**
```
feat(turmas): criar/listar/obter com RBAC (ADMIN|Coordenador)
```

---

### Eixo 3 — Perfis & Vínculos (Aluno/Professor ↔ Turma)
**Objetivo:** matricular alunos e vincular professores à turma.  
**Por que agora:** pré-requisito para **Aula** (professor só cria se vinculado) e **Presença** (aluno precisa estar na turma).

**Entregáveis**
- Rotas:
  - `POST /turmas/:id/alunos` (matricular) – unique `(id_turma,id_aluno)`.
  - `POST /turmas/:id/professores` (vincular) – unique `(id_turma,id_professor)`.
- (Opcional) `POST /alunos` e `POST /professores` a partir de `id_usuario`.

**Testes**
- matrícula duplicada → 409.  
- vínculo duplicado → 409.

**Commit**
```
feat(vinculos): matricular aluno e vincular professor à turma com unicidade
```

---

### Eixo 4 — Aulas (agenda por turma)
**Objetivo:** criar e consultar aulas por turma.  
**Por que agora:** “pivô” da presença; separa calendário acadêmico da presença.

**Entregáveis**
- DTO: `criarAulaDTO` (data obrigatória; horas opcionais).
- Rotas:
  - `POST /turmas/:id/aulas` (ADMIN|PROFESSOR vinculado)
  - `GET /turmas/:id/aulas?de&ate`
  - `GET /aulas/:id`
- Regra de negócio: professor **precisa estar vinculado** à turma (checagem no Service, além do RBAC).

**Testes**
- professor não vinculado → 403.  
- listagem com filtro de datas.

**Commit**
```
feat(aulas): criar/listar/obter com verificação de vínculo do professor
```

---

### Eixo 5 — Presenças (marcações em lote)
**Objetivo:** registrar presença por **aula+aluno** com status.

**Entregáveis**
- DTO: `marcarPresencaDTO` (array `{id_aluno,status,observacao?}`).
- Rotas:
  - `POST /aulas/:id/presencas` (ADMIN|PROFESSOR)
  - `GET /aulas/:id/presencas`
- Regra: único `(id_aula,id_aluno)` (upsert).

**Testes**
- marcação repetida atualiza (não duplica).
- listagem retorna itens com aluno.

**Commit**
```
feat(presencas): marcação em lote (upsert) e listagem por aula
```

---

### Eixo 6 — Relatórios (MVP)
**Objetivo:** consolidar presenças por turma e período.

**Entregáveis**
- `GET /turmas/:id/presencas/relatorio?de&ate` (ADMIN|COORDENADOR|PROFESSOR).
- Resultado: por aluno (% presente, ausente, atraso, justificadas).

**Testes**
- filtros de data, ordenação por presença.

**Commit**
```
feat(relatorios): resumo de presença por turma e período
```

---

### Eixo 7 — Observabilidade & DevOps (mínimo)
**Objetivo:** logs úteis, health/ready, seeds.

**Entregáveis**
- Logger `pino`, `requestId` (opcional).
- `/health` e (opcional) `/ready`.
- `db:seed` (ADMIN, turma demo).

**Commit**
```
chore(ops): pino logger, health/ready e seed inicial
```

---

### Eixo 8 — Documentação & QA
**Objetivo:** alinhar contrato de API e qualidade.

**Entregáveis**
- OpenAPI 3.0 (Swagger UI no dev, `/docs`).
- Testes de integração: auth flow, turma, aula, presença.
- ESLint + Prettier aplicados.

**Commit**
```
docs(swagger): contrato v1 + testes de integração principais
```

---

## Prioridades (MoSCoW)
- **Must**: Autenticação+RBAC, Turmas, Vínculos, Aulas, Presenças.  
- **Should**: Relatório de presença simples, Seeds, Logs/Health.  
- **Could**: Swagger UI, paginação/ordenar, rate limit.  
- **Won’t (MVP)**: Portal do aluno, notificações, integrações externas.

---

## Mapa de Endpoints (MVP)
**Auth**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET  /api/v1/auth/me`

**Turmas**
- `POST /api/v1/turmas`
- `GET  /api/v1/turmas`
- `GET  /api/v1/turmas/:id`
- `POST /api/v1/turmas/:id/alunos`
- `POST /api/v1/turmas/:id/professores`

**Aulas**
- `POST /api/v1/turmas/:id/aulas`
- `GET  /api/v1/turmas/:id/aulas?de&ate`
- `GET  /api/v1/aulas/:id`

**Presenças**
- `POST /api/v1/aulas/:id/presencas`
- `GET  /api/v1/aulas/:id/presencas`
- *(Opcional extra)* `GET /api/v1/turmas/:id/presencas/relatorio?de&ate`

---

## Critérios de Aceite por Eixo (DoD)
- **API responde** com status e payloads conforme DTOs.  
- **RBAC** nega corretamente papéis sem permissão.  
- **Regras de negócio** (unicidades, vínculo do professor) testadas.  
- **DB** com constraints (uniques, FKs, índices) aplicadas.  
- **Logs** úteis em caso de erro.  
- **Tests** de integração básicos passando.  
- **Swagger** (opcional no MVP) reflete endpoints principais.

---

## Plano de Aprendizagem Paralelo
- **Eixo 1 (Auth/RBAC):** JWT (payload, exp, assinatura), bcrypt (hash/compare), middleware Express, RBAC vs ABAC.  
- **Eixo 2 (Turmas):** DTO com Zod, padrões de controller/service/repo.  
- **Eixo 3 (Vínculos):** chaves compostas e `unique` em Prisma/Postgres.  
- **Eixo 4 (Aulas):** manipulação de datas (fuso/UTC), índices `(id_turma, data)`.  
- **Eixo 5 (Presenças):** transações/upsert em lote, idempotência.  
- **Eixo 7 (Ops):** pino logger, health/ready, seeds.  
- **Eixo 8 (Docs/QA):** OpenAPI, Supertest/Vitest.

---

## Estrutura de Pastas
```
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
```

---

## Modelo de Dados (DDL Postgres)
> Equivalente ao schema Prisma. Todos os `id` são `uuid`.

```sql
-- extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USUARIO
CREATE TABLE usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN','PROFESSOR','Coordenador','ALUNO')),
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
  periodo text,
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
  papel text DEFAULT 'RESPONSAVEL',
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
```

---

## Scripts & Execução
**Instalação (runtime)**
```bash
npm i express cors helmet dotenv jsonwebtoken bcryptjs zod @prisma/client pino
```
**DevDeps**
```bash
npm i -D typescript tsx @types/node @types/express @types/jsonwebtoken @types/bcryptjs prisma eslint prettier eslint-config-prettier vitest supertest @types/supertest
```
**Scripts `package.json`**
```json
{
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```
**Docker (DB local)**
```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: chamadaweb
    ports: ["5432:5432"]
    volumes: [ "db_data:/var/lib/postgresql/data" ]
volumes:
  db_data:
```

---

## Mensagens de Commit (sugestões)
- `feat(auth): register/login/me + JWT + RBAC por ação`
- `feat(turmas): criar/listar/obter com RBAC`
- `feat(vinculos): matricular aluno e vincular professor (unique constraints)`
- `feat(aulas): criar/listar/obter com verificação de vínculo`
- `feat(presencas): marcação em lote (upsert) e listagem por aula`
- `feat(relatorios): resumo de presença por turma e período`
- `chore(ops): logger pino, health/ready e seed`
- `docs(swagger): contrato v1 e exemplos`
- `test(api): smoke e fluxos principais`

---

## Observações de Modelagem
- Papel **Coordenador** (substitui “coordenador” para manter consistência com schema e RBAC).  
- `PRESENCA` única por `(id_aula, id_aluno)`; não gravar `data_aula` direto em presença.  
- Índice em `AULA(id_turma, data_aula)` para listagens por período.  
- `ON DELETE CASCADE` nos vínculos para manter integridade.

---

> **Próximo passo sugerido:** Implementar **Eixo 1 (Auth/RBAC)** — DTOs, middlewares `auth` + `rbacPermit`, service `AuthService`, rotas `/auth/*`, testes básicos.