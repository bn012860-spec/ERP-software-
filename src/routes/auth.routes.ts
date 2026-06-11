import { Router } from "express";
import { login, register, whoami } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/whoami", authenticate, whoami);

export default router;
