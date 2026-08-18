import { z } from "zod";
import Player from "../models/Player.js";
import { buildStatsSummary, buildLevelUpPlan } from "../utils/stats.js";

const updateSchema = z.object({
  preferredHand: z.enum(["LEFT", "RIGHT"]).optional(),
  playStyle: z.enum(["AGGRESSIVE", "DEFENSIVE", "BALANCED", "COUNTER_ATTACKER"]).optional(),
  currentPaddle: z.string().nullable().optional(),
});

export async function getMyProfile(req, res, next) {
  try {
    const player = await Player.findOne({ user: req.userId }).populate("currentPaddle").populate("user", "name email");
    if (!player) return res.status(404).json({ message: "Player profile not found" });
    res.json({
      player,
      stats: buildStatsSummary(player),
      levelUp: buildLevelUpPlan(player),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const data = updateSchema.parse(req.body);
    const player = await Player.findOneAndUpdate({ user: req.userId }, data, { new: true }).populate("currentPaddle");
    res.json(player);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: err.errors[0].message });
    next(err);
  }
}

export async function getPlayerById(req, res, next) {
  try {
    const player = await Player.findById(req.params.id).populate("user", "name").populate("currentPaddle");
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json({ player, stats: buildStatsSummary(player) });
  } catch (err) {
    next(err);
  }
}

// Simple name search so the "select players" step in open play stays fast.
export async function searchPlayers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    const Player_ = (await import("../models/Player.js")).default;
    const players = await Player_.find().populate({
      path: "user",
      select: "name",
      match: q ? { name: { $regex: q, $options: "i" } } : {},
    });
    res.json(players.filter((p) => p.user));
  } catch (err) {
    next(err);
  }
}
