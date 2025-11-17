import { Router } from "express";
import { AulaController } from "../controllers/aula.controller.js";
import { PresencaController } from "../controllers/presenca.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbacPermit } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { atualizarAulaDTO } from "../dtos/aula.dto.js";
import { marcarPresencasDTO } from "../dtos/presenca.dto.js";

const router = Router();

// Todas as rotas de aulas exigem autenticação
router.use(auth);

// GET /aulas/:id - Obter aula por ID (qualquer autenticado)
router.get("/:id", AulaController.obter);

// PUT /aulas/:id - Atualizar aula (ADMIN|PROFESSOR vinculado)
router.put(
  "/:id",
  rbacPermit("AULA_UPDATE"),
  validate(atualizarAulaDTO),
  AulaController.atualizar
);

// DELETE /aulas/:id - Deletar aula (ADMIN|PROFESSOR vinculado)
router.delete("/:id", rbacPermit("AULA_DELETE"), AulaController.deletar);

// POST /aulas/:id/presencas - Marcar presenças (ADMIN|PROFESSOR)
router.post(
  "/:id/presencas",
  rbacPermit("PRESENCA_BATCH_MARK"),
  validate(marcarPresencasDTO),
  PresencaController.marcar
);

// GET /aulas/:id/presencas - Listar presenças (qualquer autenticado)
router.get("/:id/presencas", PresencaController.listar);

export default router;
