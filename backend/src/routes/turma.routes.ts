import { Router } from "express";
import { TurmaController } from "../controllers/turma.controller.js";
import { AlunoController } from "../controllers/aluno.controller.js";
import { ProfessorController } from "../controllers/professor.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbacPermit } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { criarTurmaDTO, atualizarTurmaDTO } from "../dtos/turma.dto.js";
import {
  matricularAlunoDTO,
  vincularProfessorDTO,
} from "../dtos/vinculo.dto.js";

const router = Router();

// Todas as rotas de turmas exigem autenticação
router.use(auth);

// POST /turmas - Criar turma (ADMIN|COORDENADOR)
router.post(
  "/",
  rbacPermit("TURMA_CREATE"),
  validate(criarTurmaDTO),
  TurmaController.criar
);

// GET /turmas - Listar turmas (qualquer autenticado)
router.get("/", TurmaController.listar);

// GET /turmas/:id - Obter turma por ID (qualquer autenticado)
router.get("/:id", TurmaController.obterPorId);

// PUT /turmas/:id - Atualizar turma (ADMIN|COORDENADOR)
router.put(
  "/:id",
  rbacPermit("TURMA_UPDATE"),
  validate(atualizarTurmaDTO),
  TurmaController.atualizar
);

// DELETE /turmas/:id - Deletar turma (ADMIN)
router.delete("/:id", rbacPermit("TURMA_DELETE"), TurmaController.deletar);

// POST /turmas/:id/alunos - Matricular aluno (ADMIN|COORDENADOR)
router.post(
  "/:id/alunos",
  rbacPermit("TURMA_ALUNO_ADD"),
  validate(matricularAlunoDTO),
  AlunoController.matricular
);

// GET /turmas/:id/alunos - Listar alunos da turma (qualquer autenticado)
router.get("/:id/alunos", AlunoController.listarAlunosDaTurma);

// DELETE /turmas/:id/alunos/:idAluno - Remover matrícula (ADMIN|COORDENADOR)
router.delete(
  "/:id/alunos/:idAluno",
  rbacPermit("TURMA_ALUNO_ADD"),
  AlunoController.removerMatricula
);

// POST /turmas/:id/professores - Vincular professor (ADMIN|COORDENADOR)
router.post(
  "/:id/professores",
  rbacPermit("TURMA_PROFESSOR_ADD"),
  validate(vincularProfessorDTO),
  ProfessorController.vincular
);

// GET /turmas/:id/professores - Listar professores da turma (qualquer autenticado)
router.get("/:id/professores", ProfessorController.listarProfessoresDaTurma);

// DELETE /turmas/:id/professores/:idProfessor - Remover vínculo (ADMIN|COORDENADOR)
router.delete(
  "/:id/professores/:idProfessor",
  rbacPermit("TURMA_PROFESSOR_ADD"),
  ProfessorController.removerVinculo
);

export default router;
