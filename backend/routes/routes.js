import express from "express";
import controller from "../controllers/controllers.js";
import Auth from "../controllers/Auth.js";
const router = express.Router();

router.post("/register", controller.Register);
router.post("/login", controller.Login);
router.post("/logout", controller.Logout);

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

router.get("/submissions/:id",Auth,controller.SubmissionsbyId);
router.get("/submissions",Auth,controller.Submissions);

router.get("/contests",Auth,controller.AllContests);

router.post("/contest",Auth,controller.CreateContest);
router.get("/contests/:id",Auth,controller.ContestById);
router.put("/contests/:id",Auth,controller.UpdateContest);
router.delete("/contests/:id",Auth,controller.DeleteContest);

router.get("/contests/:id/submissions",Auth,controller.GetContestSubmissions);
router.get("/contests/:id/users/:userId/submissions",Auth,controller.UserContestSubmissions);
router.delete("/contests/:id/submissions/:problemId",Auth,controller.DeleteContestSubmission);

router.get("/contests/:id/results",Auth,controller.ContestResults);

router.post("/contests/:id/register",Auth, controller.registerForContest);
router.get("/contests/:id/isRegistered",Auth, controller.checkRegistration);
export default router;     