import { Router } from "express";
import { getMyProfile, updateMyProfile, getPlayerById, searchPlayers } from "../controllers/playerController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/me", requireAuth, getMyProfile);
router.patch("/me", requireAuth, updateMyProfile);
router.get("/search", requireAuth, searchPlayers);
router.get("/:id", requireAuth, getPlayerById);

export default router;
