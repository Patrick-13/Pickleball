import Player from "../models/Player.js";
import { buildLevelUpPlan } from "../utils/stats.js";
import { buildTrainingPlan } from "../utils/trainingPlan.js";

export async function getMyTrainingPlan(req, res, next) {
  try {
    const player = await Player.findOne({ user: req.userId });
    if (!player) return res.status(404).json({ message: "Player profile not found" });

    const levelUp = buildLevelUpPlan(player);
    const plan = await buildTrainingPlan(levelUp, player.ratings.appRating);
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}
