import { Router } from "express";
import { createGame, listGamesForPlayer } from "../controllers/gameController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/", requireAuth, createGame);
router.get("/player/:playerId", requireAuth, listGamesForPlayer);

export default router;
