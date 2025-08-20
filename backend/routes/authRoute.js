import { Router } from "express";
import { register, login, me } from "../controllers/authContoller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth(), me);

export default router;