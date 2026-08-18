// Turns raw counters into the percentages and simple coaching-style insights
// the frontend renders. Deliberately rule-based (see doc section 30, V1) —
// no AI in the MVP, just thresholds. Swap this file out later for a smarter engine.

function pct(successful, attempted) {
  if (!attempted) return null;
  return Math.round((successful / attempted) * 1000) / 10;
}

const SKILL_LABELS = {
  serve: "Serve",
  return: "Return",
  dink: "Dinking",
  thirdShotDrop: "Third Shot Drop",
  thirdShotDrive: "Third Shot Drive",
  volley: "Volley",
  reset: "Reset / Transition",
};

export function buildStatsSummary(player) {
  const s = player.stats;
  const winRate = s.gamesPlayed ? Math.round((s.wins / s.gamesPlayed) * 1000) / 10 : 0;

  const breakdown = Object.entries(SKILL_LABELS).map(([key, label]) => ({
    key,
    label,
    successRate: pct(s[key]?.successful ?? 0, s[key]?.attempted ?? 0),
    attempted: s[key]?.attempted ?? 0,
  }));

  return {
    overall: {
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      winRate,
      pointsWon: s.pointsWon,
      pointsLost: s.pointsLost,
      longestWinStreak: s.longestWinStreak,
      currentWinStreak: s.currentWinStreak,
    },
    breakdown,
  };
}

// Ranks tracked skills with enough sample size, lowest success rate first,
// and turns the top 3 into a "Level Up" priority list.
export function buildLevelUpPlan(player) {
  const s = player.stats;
  const MIN_ATTEMPTS = 5; // don't recommend on tiny sample sizes

  const candidates = Object.entries(SKILL_LABELS)
    .map(([key, label]) => {
      const attempted = s[key]?.attempted ?? 0;
      const successRate = pct(s[key]?.successful ?? 0, attempted);
      return { key, label, attempted, successRate };
    })
    .filter((c) => c.attempted >= MIN_ATTEMPTS && c.successRate !== null)
    .sort((a, b) => a.successRate - b.successRate);

  return candidates.slice(0, 3).map((c, i) => ({
    priority: i === 0 ? "HIGH" : i === 1 ? "MEDIUM" : "LOW",
    rank: i + 1,
    skill: c.label,
    key: c.key,
    current: c.successRate,
    target: Math.min(95, Math.round(c.successRate + 15)),
  }));
}
