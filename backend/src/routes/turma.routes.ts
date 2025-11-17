import { Router } from "express";
import { TurmaController } from "../controllers/turma.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbacPermit } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { criarTurmaDTO, atualizarTurmaDTO } from "../dtos/turma.dto.js";

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

export default router;
