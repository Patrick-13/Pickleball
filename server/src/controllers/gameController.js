import { z } from "zod";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import Player from "../models/Player.js";

const advancedEntrySchema = z.object({
  player: z.string(),
  serve: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  return: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  dink: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  thirdShotDrop: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  thirdShotDrive: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  volley: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  reset: z.object({ attempted: z.number(), successful: z.number() }).optional(),
  errors: z.record(z.number()).optional(),
});

const createGameSchema = z.object({
  sessionType: z.enum(["OPEN_PLAY", "CASUAL_MATCH", "PRACTICE", "DRILL_SESSION", "LEAGUE", "TOURNAMENT"]).default("OPEN_PLAY"),
  format: z.enum(["SINGLES", "DOUBLES", "MIXED_DOUBLES"]).default("DOUBLES"),
  scoringType: z.enum(["TRADITIONAL_SIDE_OUT", "RALLY"]).default("TRADITIONAL_SIDE_OUT"),
  location: z.string().optional(),
  date: z.string().optional(),
  teamA: z.array(z.string()).min(1),
  teamB: z.array(z.string()).min(1),
  scoreA: z.number().min(0),
  scoreB: z.number().min(0),
  feelings: z.array(z.object({ player: z.string(), mood: z.enum(["GREAT", "GOOD", "AVERAGE", "POOR"]) })).optional(),
  advancedStats: z.array(advancedEntrySchema).optional(),
});

// Applies one game's result to every participating player's aggregated stats.
// Deliberately kept simple/atomic for the MVP; a heavier event-sourced model
// (per doc section 29) is a good V2 upgrade once volume grows.
async function applyGameToPlayerStats(game) {
  const teamAWon = game.winningTeam === "A";
  const allEntries = [
    ...game.teamA.map((id) => ({ id, won: teamAWon, pointsFor: game.scoreA, pointsAgainst: game.scoreB })),
    ...game.teamB.map((id) => ({ id, won: !teamAWon, pointsFor: game.scoreB, pointsAgainst: game.scoreA })),
  ];

  const advancedByPlayer = new Map((game.advancedStats || []).map((a) => [String(a.player), a]));

  for (const entry of allEntries) {
    const player = await Player.findById(entry.id);
    if (!player) continue;

    player.stats.gamesPlayed += 1;
    player.stats.pointsWon += entry.pointsFor;
    player.stats.pointsLost += entry.pointsAgainst;

    if (entry.won) {
      player.stats.wins += 1;
      player.stats.currentWinStreak += 1;
      player.stats.currentLossStreak = 0;
      player.stats.longestWinStreak = Math.max(player.stats.longestWinStreak, player.stats.currentWinStreak);
    } else {
      player.stats.losses += 1;
      player.stats.currentLossStreak += 1;
      player.stats.currentWinStreak = 0;
      player.stats.longestLossStreak = Math.max(player.stats.longestLossStreak, player.stats.currentLossStreak);
    }

    const adv = advancedByPlayer.get(String(entry.id));
    if (adv) {
      for (const key of ["serve", "return", "dink", "thirdShotDrop", "thirdShotDrive", "volley", "reset"]) {
        if (adv[key]) {
          player.stats[key].attempted += adv[key].attempted;
          player.stats[key].successful += adv[key].successful;
        }
      }
      if (adv.errors) {
        for (const [errKey, count] of Object.entries(adv.errors)) {
          const current = player.stats.errors.get(errKey) || 0;
          player.stats.errors.set(errKey, current + count);
        }
      }
    }

    await player.save();
  }
}

export async function createGame(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const data = createGameSchema.parse(req.body);

    let game;
    await session.withTransaction(async () => {
      const [created] = await Game.create(
        [
          {
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
            createdBy: req.userId,
          },
        ],
        { session }
      );
      game = created;
      await applyGameToPlayerStats(game);
    });

    res.status(201).json(game);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: err.errors[0].message });
    next(err);
  } finally {
    session.endSession();
  }
}

export async function listGamesForPlayer(req, res, next) {
  try {
    const playerId = req.params.playerId;
    const games = await Game.find({ $or: [{ teamA: playerId }, { teamB: playerId }] })
      .sort({ date: -1 })
      .limit(20)
      .populate({ path: "teamA teamB", populate: { path: "user", select: "name" } });
    res.json(games);
  } catch (err) {
    next(err);
  }
}
