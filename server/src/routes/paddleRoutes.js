import { Router } from "express";
import { listPaddles, getMyRecommendations } from "../controllers/paddleController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", requireAuth, listPaddles);
router.get("/recommendations/me", requireAuth, getMyRecommendations);

export default router;
