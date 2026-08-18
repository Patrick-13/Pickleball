import Player from "../models/Player.js";

// Simple global leaderboard for the MVP: ranked by app rating, tie-broken by win rate.
// Clubs/courts-scoped leaderboards (doc section 23) are a natural V2 filter on this same query.
export async function getLeaderboard(req, res, next) {
  try {
    const sortBy = req.query.sortBy === "winRate" ? null : "ratings.appRating";
    const players = await Player.find({ "stats.gamesPlayed": { $gt: 0 } })
      .populate("user", "name")
      .lean({ virtuals: true });

    const ranked = players
      .map((p) => ({
        id: p._id,
        name: p.user?.name || "Unknown",
        appRating: p.ratings.appRating,
        gamesPlayed: p.stats.gamesPlayed,
        wins: p.stats.wins,
        losses: p.stats.losses,
        winRate: p.stats.gamesPlayed ? Math.round((p.stats.wins / p.stats.gamesPlayed) * 1000) / 10 : 0,
        playStyle: p.playStyle,
      }))
      .sort((a, b) => (sortBy ? b.appRating - a.appRating : b.winRate - a.winRate));

    res.json(ranked.map((p, i) => ({ rank: i + 1, ...p })));
  } catch (err) {
    next(err);
  }
}
