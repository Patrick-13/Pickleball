import Paddle from "../models/Paddle.js";
import Player from "../models/Player.js";
import { recommendPaddles } from "../utils/paddleRecommendation.js";

export async function listPaddles(req, res, next) {
  try {
    const paddles = await Paddle.find().sort({ brand: 1, model: 1 });
    res.json(paddles);
  } catch (err) {
    next(err);
  }
}

export async function getMyRecommendations(req, res, next) {
  try {
    const player = await Player.findOne({ user: req.userId });
    if (!player) return res.status(404).json({ message: "Player profile not found" });

    if (player.stats.gamesPlayed < 3) {
      return res.json({
        needs: null,
        recommendations: [],
        message: "Log at least 3 games with performance stats to unlock paddle recommendations.",
      });
    }

    const paddles = await Paddle.find();
    const { needs, recommendations } = recommendPaddles(paddles, player);
    res.json({ needs, recommendations: recommendations.slice(0, 5) });
  } catch (err) {
    next(err);
  }
}
