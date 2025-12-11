import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbacPermit } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { atualizarUsuarioDTO } from "../dtos/usuario.dto.js";

const router = Router();

// Todas as rotas exigem autenticação
router.use(auth);

// GET /usuarios - Listar usuários (ADMIN|COORDENADOR)
router.get("/", rbacPermit("USUARIO_READ"), UsuarioController.listar);

// GET /usuarios/:id - Obter usuário (ADMIN|COORDENADOR)
router.get("/:id", rbacPermit("USUARIO_READ"), UsuarioController.obterPorId);

// PUT /usuarios/:id - Atualizar usuário (ADMIN)
router.put(
  "/:id",
  rbacPermit("USUARIO_UPDATE"),
  validate(atualizarUsuarioDTO),
  UsuarioController.atualizar
);

// DELETE /usuarios/:id - Deletar usuário (ADMIN)
router.delete("/:id", rbacPermit("USUARIO_DELETE"), UsuarioController.deletar);

export default router;
