import { Router } from "express";
import { getMyTrainingPlan } from "../controllers/trainingController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/me", requireAuth, getMyTrainingPlan);

export default router;
