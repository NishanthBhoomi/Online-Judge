import express from "express";
import controller from "../controllers/controllers.js";
import Auth from "../controllers/Auth.js";
const router = express.Router();

router.post("/register", controller.Register);
router.post("/login", controller.Login);
router.get("/problems",Auth, controller.Problems);
router.get("/problem/:id",Auth, controller.ProblemById);
router.post("/run",Auth,controller.RunCode);
export default router;
