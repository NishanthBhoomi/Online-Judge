import express from "express";
import controller from "../controllers/controllers.js";
import Auth from "../controllers/Auth.js";
const router = express.Router();

router.post("/register", controller.Register);
router.post("/login", controller.Login);
router.get("/profile",Auth, controller.Profile);
router.put("/update",Auth, controller.UpdateProfile);

router.get("/problems",Auth, controller.Problems);
router.get("/problem/:id",Auth, controller.ProblemById);

router.post("/run",Auth,controller.RunCode);
router.post("/submit",Auth,controller.SubmitCode);

router.get("/all",Auth,controller.AllUsers);
router.delete("/delete/:id",Auth,controller.DeleteUser);
router.put("/update/:id",Auth,controller.UpdateUser);

router.put("/problem/:id",Auth,controller.UpdateProblem);
router.delete("/problem/:id",Auth,controller.DeleteProblem);
router.post("/problem",Auth,controller.AddProblem);

router.get("/submissions",Auth,controller.Submissions);
export default router;