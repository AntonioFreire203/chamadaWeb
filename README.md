# 🎓 ChamadaWeb - Sistema de Gestão de Cursinho

Sistema completo para gestão de cursinhos comunitários com controle de turmas, aulas, presenças e relatórios.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Configuração Inicial](#️-configuração-inicial)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
  - [Opção 1: Com Docker](#opção-1-com-docker-recomendado)
  - [Opção 2: Sem Docker](#opção-2-sem-docker)
- [Credenciais Padrão](#-credenciais-padrão)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)

---

## 🚀 Tecnologias

### Backend
- **Node.js 20+** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL 14+** - Banco de dados
- **Prisma ORM** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Vitest** - Testes

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Shadcn/ui** - Componentes UI

---

## ⚙️ Configuração Inicial

### Credenciais de Administrador Padrão

Para acessar o sistema pela primeira vez, use as credenciais padrão do administrador:

```
Email: admin@teste.com
Senha: admin123
```

**⚠️ IMPORTANTE:** Após o primeiro acesso, altere essas credenciais por questões de segurança.

### Sistema de Registro

- ❌ **Registro público desabilitado**: A rota `/register` foi removida para segurança
- ✅ **Apenas administradores podem criar usuários**: Acesse `/usuarios` (logado como ADMIN)
- 📧 **Professores recebem email**: Após criação, professores recebem email com link para definir senha
- 🔐 **Roles disponíveis**: ADMIN, COORDENADOR, PROFESSOR

---

## 🐳 Como Rodar o Projeto

### Opção 1: Com Docker (Recomendado)

#### Pré-requisitos
- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

#### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd chamadaWeb
```

2. **Configure as variáveis de ambiente**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (se necessário)
cp frontend/.env.example frontend/.env
```

3. **Suba os containers**
```bash
docker-compose up -d
```

4. **Execute as migrations e seed**
```bash
# Migrations
docker-compose exec backend npx prisma migrate deploy

# Seed (criar admin padrão e dados de exemplo)
docker-compose exec backend npm run seed
```

5. **Acesse o sistema**
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Documentação API**: http://localhost:3000/api-docs

#### Comandos úteis com Docker

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v

# Reiniciar apenas um serviço
docker-compose restart backend
docker-compose restart frontend
```

---

### Opção 2: Sem Docker

#### Pré-requisitos
- [Node.js 20+](https://nodejs.org/) instalado
- [PostgreSQL 14+](https://www.postgresql.org/download/) instalado e rodando
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

#### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd chamadaWeb
```

2. **Configure o PostgreSQL**
```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE chamadaweb;
CREATE DATABASE chamadaweb_test; -- para testes

# Saia do psql
\q
```

3. **Configure o Backend**
```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o .env com suas configurações
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chamadaweb
# JWT_SECRET=seu_secret_aqui
# PORT=3000
```

4. **Execute as migrations e seed**
```bash
# Migrations
npx prisma migrate deploy

# Seed (criar admin padrão)
npm run seed
```

5. **Inicie o backend**
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

6. **Configure o Frontend**
```bash
# Em outro terminal
cd frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente (se necessário)
cp .env.example .env

# Inicie o frontend
npm run dev
```

7. **Acesse o sistema**
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000

#### Scripts úteis sem Docker

```bash
# Backend
cd backend
npm run dev          # Modo desenvolvimento com hot reload
npm run build        # Build para produção
npm start           # Roda versão de produção
npm test            # Executa testes
npm run seed        # Popula banco com dados iniciais
npx prisma studio   # Interface visual do banco

# Frontend
cd frontend
npm run dev         # Modo desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview da build de produção
```

---

## 🔑 Credenciais Padrão

Após executar o seed, use estas credenciais para primeiro acesso:

```
Email: admin@teste.com
Senha: admin123
```

**⚠️ IMPORTANTE:** 
- Altere essas credenciais após o primeiro acesso
- Crie novos usuários através da rota `/usuarios` (apenas ADMIN)
- Nunca compartilhe suas credenciais

---

## 📂 Estrutura do Projeto

```
chamadaWeb/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── services/       # Lógica de negócio
│   │   ├── repositories/   # Acesso a dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Auth, RBAC, validação
│   │   ├── dtos/           # Data Transfer Objects
│   │   ├── utils/          # Utilidades
│   │   └── db/             # Prisma e seeds
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco
│   ├── tests/              # Testes integrados
│   └── .env.example        # Exemplo de variáveis
│
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Chamadas à API
│   │   ├── hooks/          # React hooks customizados
│   │   └── lib/            # Utilitários
│   └── public/             # Arquivos estáticos
│
├── docker-compose.yml      # Orquestração Docker
└── README.md              # Este arquivo
```

---

## 🗂️ Entidades (MVP)

1. **USUARIO** - Credenciais e perfis/roles
2. **ALUNO** - Perfil de estudante
3. **PROFESSOR** - Perfil de professor
4. **TURMA** - Turmas do cursinho
5. **AULA** - Aulas agendadas (data/hora/conteúdo)
6. **TURMA_ALUNO** - Matrícula do aluno na turma
7. **TURMA_PROFESSOR** - Alocação do professor na turma
8. **PRESENCA** - Registro de presença por aula

---

## 📜 Regras de Negócio

### Roles e Permissões

- **ADMIN**: Acesso total, gerencia usuários, turmas, professores e alunos
- **COORDENADOR**: Gerencia turmas, professores e alunos
- **PROFESSOR**: Gerencia aulas e registra presenças

### Regras Principais

1. **AULA** só pode ser criada por PROFESSOR da turma ou ADMIN
2. **PRESENCA**: valores `PRESENTE | AUSENTE | ATRASO | JUSTIFICADA` + timestamp
3. **TURMA_ALUNO**: impede duplicidade (único por `id_turma + id_aluno`)
4. **PRESENCA**: única por `id_aula + id_aluno`
5. Apenas **ADMIN** pode acessar `/usuarios` e criar novos usuários

---

## 🛠️ Padrões e Tecnologias

- **Arquitetura**: MVC expandida (Controllers → Services → Repositories)
- **Autenticação**: JWT (HS256) + RBAC
- **Validação**: Zod para DTOs
- **Logs**: Pino
- **Segurança**: Helmet + CORS
- **Testes**: Vitest + Supertest
- **Documentação**: OpenAPI 3.0

---

## 📡 Endpoints da API

### Autenticação
```
POST   /api/v1/auth/register     # Criar usuário (ADMIN only)
POST   /api/v1/auth/login        # Login
GET    /api/v1/auth/me           # Dados do usuário autenticado
```

### Usuários
```
GET    /api/v1/usuarios          # Listar usuários (ADMIN)
GET    /api/v1/usuarios/:id      # Obter usuário
PUT    /api/v1/usuarios/:id      # Atualizar usuário (ADMIN)
DELETE /api/v1/usuarios/:id      # Deletar usuário (ADMIN)
```

### Alunos
```
POST   /api/v1/alunos            # Criar perfil de aluno
GET    /api/v1/alunos            # Listar alunos
GET    /api/v1/alunos/:id        # Obter aluno
PUT    /api/v1/alunos/:id        # Atualizar aluno
DELETE /api/v1/alunos/:id        # Deletar aluno
```

### Professores
```
POST   /api/v1/professores       # Criar perfil de professor
GET    /api/v1/professores       # Listar professores
GET    /api/v1/professores/:id   # Obter professor
PUT    /api/v1/professores/:id   # Atualizar professor
DELETE /api/v1/professores/:id   # Deletar professor
```

### Turmas
```
POST   /api/v1/turmas                          # Criar turma (ADMIN|COORDENADOR)
GET    /api/v1/turmas                          # Listar turmas
GET    /api/v1/turmas/:id                      # Obter turma
PUT    /api/v1/turmas/:id                      # Atualizar turma
DELETE /api/v1/turmas/:id                      # Deletar turma
POST   /api/v1/turmas/:id/alunos               # Matricular aluno
DELETE /api/v1/turmas/:id/alunos/:idAluno      # Remover matrícula
POST   /api/v1/turmas/:id/professores          # Vincular professor
DELETE /api/v1/turmas/:id/professores/:idProf  # Remover vínculo
```

### Aulas
```
POST   /api/v1/turmas/:idTurma/aulas           # Criar aula (PROFESSOR|ADMIN)
GET    /api/v1/turmas/:idTurma/aulas           # Listar aulas da turma
GET    /api/v1/aulas/:id                       # Obter aula
PUT    /api/v1/aulas/:id                       # Atualizar aula
DELETE /api/v1/aulas/:id                       # Deletar aula
```

### Presenças
```
POST   /api/v1/aulas/:id/presencas             # Registrar presenças (batch)
GET    /api/v1/aulas/:id/presencas             # Listar presenças da aula
PATCH  /api/v1/presencas/:id                   # Atualizar presença
```

### Relatórios
```
GET    /api/v1/turmas/:id/presencas/relatorio?de=YYYY-MM-DD&ate=YYYY-MM-DD
```

---

## 🔒 Segurança

- **JWT** em `Authorization: Bearer <token>`
- **RBAC**: Middleware verifica `req.user.role` vs permissões da rota
- **Rate Limit**: 100 requisições por 15 minutos por IP
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configurado para domínios permitidos
- **Bcrypt**: Hash de senhas com salt

---

## 🧪 Testes

```bash
# Backend
cd backend
npm test              # Executar todos os testes
npm run test:watch    # Modo watch
npm run test:cov      # Coverage

# Frontend
cd frontend
npm test
```

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Abra uma [issue](https://github.com/seu-usuario/chamadaweb/issues)
- Entre em contato: admin@cursinho.utfpr.edu.br