import { Router } from "express";
import { AlunoController } from "../controllers/aluno.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbacPermit } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { criarAlunoDTO, atualizarAlunoDTO } from "../dtos/aluno.dto.js";

const router = Router();

// Todas as rotas exigem autenticação
router.use(auth);

// POST /alunos - Criar perfil de aluno (ADMIN|COORDENADOR)
router.post(
  "/",
  rbacPermit("ALUNO_CREATE"),
  validate(criarAlunoDTO),
  AlunoController.criar
);

// GET /alunos - Listar alunos (ADMIN|COORDENADOR)
router.get("/", rbacPermit("ALUNO_READ"), AlunoController.listar);

// GET /alunos/:id - Obter aluno (ADMIN|COORDENADOR)
router.get("/:id", rbacPermit("ALUNO_READ"), AlunoController.obterPorId);

// PUT /alunos/:id - Atualizar aluno (ADMIN|COORDENADOR)
router.put(
  "/:id",
  rbacPermit("ALUNO_UPDATE"),
  validate(atualizarAlunoDTO),
  AlunoController.atualizar
);

// DELETE /alunos/:id - Deletar aluno (ADMIN)
router.delete("/:id", rbacPermit("ALUNO_DELETE"), AlunoController.deletar);

export default router;
