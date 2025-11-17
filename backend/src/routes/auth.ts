import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { loginDTO, registerDTO } from "../dtos/auth.dto";
import { auth } from "../middlewares/auth";
import { rbacPermit, Actions } from "../middlewares/rbac";

const r = Router();

r.post("/register", validate(registerDTO), AuthController.register);
r.post("/login", validate(loginDTO), AuthController.login);
r.get("/me", auth, rbacPermit(Actions.USER_READ_SELF), AuthController.me);

export default r;
