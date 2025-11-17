import { Router } from "express";
import { ProfessorController } from "../controllers/professor.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbacPermit } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  criarProfessorDTO,
  atualizarProfessorDTO,
} from "../dtos/professor.dto.js";

const router = Router();

// Todas as rotas exigem autenticação
router.use(auth);

// POST /professores - Criar perfil de professor (ADMIN|COORDENADOR)
router.post(
  "/",
  rbacPermit("PROFESSOR_CREATE"),
  validate(criarProfessorDTO),
  ProfessorController.criar
);

// GET /professores - Listar professores (ADMIN|COORDENADOR)
router.get("/", rbacPermit("PROFESSOR_READ"), ProfessorController.listar);

// GET /professores/:id - Obter professor (ADMIN|COORDENADOR)
router.get(
  "/:id",
  rbacPermit("PROFESSOR_READ"),
  ProfessorController.obterPorId
);

// PUT /professores/:id - Atualizar professor (ADMIN|COORDENADOR)
router.put(
  "/:id",
  rbacPermit("PROFESSOR_UPDATE"),
  validate(atualizarProfessorDTO),
  ProfessorController.atualizar
);

// DELETE /professores/:id - Deletar professor (ADMIN)
router.delete(
  "/:id",
  rbacPermit("PROFESSOR_DELETE"),
  ProfessorController.deletar
);

export default router;
