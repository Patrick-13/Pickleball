// Weighted-scoring paddle recommendation engine (doc sections 18-19).
// Deliberately NOT an LLM call — a transparent formula the player can be
// shown ("Why: improves control, large sweet spot...") is safer and cheaper
// than letting a model freelance equipment advice. Swap in AI later (V3)
// to turn this same scored output into natural language, not to do the scoring.

function pct(successful, attempted) {
  if (!attempted) return null;
  return (successful / attempted) * 100;
}

// Converts raw player stats into 0-10 "need" scores per paddle attribute.
// A LOW success rate in the skills that attribute supports => HIGH need.
export function derivePlayerNeeds(stats) {
  const dink = pct(stats.dink.successful, stats.dink.attempted);
  const drop = pct(stats.thirdShotDrop.successful, stats.thirdShotDrop.attempted);
  const reset = pct(stats.reset.successful, stats.reset.attempted);
  const drive = pct(stats.thirdShotDrive.successful, stats.thirdShotDrive.attempted);
  const serve = pct(stats.serve.successful, stats.serve.attempted);
  const volley = pct(stats.volley.successful, stats.volley.attempted);

  const controlInputs = [dink, drop, reset].filter((v) => v !== null);
  const controlAvg = controlInputs.length ? controlInputs.reduce((a, b) => a + b, 0) / controlInputs.length : 55; // neutral default

  // Power need is the INVERSE of drive success: if their drive already lands
  // reliably, they don't need more power from equipment (doc section 18 example).
  const powerNeed = drive !== null ? 10 - drive / 10 : 5;
  const controlNeed = 10 - controlAvg / 10;
  const spinNeed = serve !== null ? 10 - serve / 10 : 5;
  const sweetSpotNeed = volley !== null ? 10 - volley / 10 : 5;

  const clamp = (v) => Math.max(0, Math.min(10, Math.round(v * 10) / 10));

  return {
    powerNeed: clamp(powerNeed),
    controlNeed: clamp(controlNeed),
    spinNeed: clamp(spinNeed),
    sweetSpotNeed: clamp(sweetSpotNeed),
    // Human-readable labels for the "player profile" summary shown in the UI.
    profile: {
      power: powerNeed <= 4 ? "HIGH" : powerNeed <= 6.5 ? "MEDIUM" : "LOW",
      control: controlNeed >= 6.5 ? "LOW" : controlNeed >= 4 ? "MEDIUM" : "HIGH",
      // Note: these read as "current strength", not need — see UI copy.
    },
  };
}

function levelFromRating(appRating) {
  if (appRating < 3.0) return "BEGINNER";
  if (appRating < 4.0) return "INTERMEDIATE";
  return "ADVANCED";
}

const LEVEL_ORDER = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"];

function skillCompatibility(paddleLevel, playerLevel) {
  const diff = Math.abs(LEVEL_ORDER.indexOf(paddleLevel) - LEVEL_ORDER.indexOf(playerLevel));
  return Math.max(0, 10 - diff * 4); // exact match = 10, one level off = 6, etc.
}

function playStyleCompatibility(paddle, playStyle) {
  // Rough fit rules: aggressive players benefit from power/spin,
  // defensive/counter players benefit from control/sweet spot.
  switch (playStyle) {
    case "AGGRESSIVE":
      return (paddle.power + paddle.spin) / 2;
    case "DEFENSIVE":
      return (paddle.control + paddle.sweetSpot) / 2;
    case "COUNTER_ATTACKER":
      return (paddle.control + paddle.spin) / 2;
    case "BALANCED":
    default:
      return (paddle.power + paddle.control + paddle.spin + paddle.sweetSpot) / 4;
  }
}

// Core formula from doc section 19:
// score = controlNeed*paddleControl + powerNeed*paddlePower + spinNeed*paddleSpin
//         + sweetSpotNeed*paddleSweetSpot + skillCompatibility + playStyleCompatibility
// Raw score is normalized against the theoretical max to produce a 0-100 "Match %".
export function scorePaddle(paddle, needs, player) {
  const playerLevel = levelFromRating(player.ratings.appRating);

  const weighted =
    needs.controlNeed * paddle.control +
    needs.powerNeed * paddle.power +
    needs.spinNeed * paddle.spin +
    needs.sweetSpotNeed * paddle.sweetSpot;

  const skillScore = skillCompatibility(paddle.playerLevel, playerLevel);
  const styleScore = playStyleCompatibility(paddle, player.playStyle);

  const rawScore = weighted + skillScore + styleScore;
  // Weighted term maxes at 4 needs * 10 * 10 = 400 in theory, but real need
  // values rarely all sit at 10 simultaneously alongside top paddle attributes.
  // A ceiling of ~150 (roughly: 4 needs at a typical ~5-6 magnitude against
  // paddle attributes around 7-8, plus up to 20 from compatibility) keeps
  // well-matched paddles landing in a believable 60-95% range instead of
  // everything clustering near 30%.
  const REALISTIC_CEILING = 150;
  const matchPercent = Math.max(0, Math.min(100, Math.round((rawScore / REALISTIC_CEILING) * 100)));

  const reasons = [];
  if (needs.controlNeed >= 6 && paddle.control >= 7) reasons.push("Improves control where you need it most");
  if (needs.powerNeed >= 6 && paddle.power >= 7) reasons.push("Adds power to your game");
  if (needs.sweetSpotNeed >= 6 && paddle.sweetSpot >= 7) reasons.push("Large sweet spot forgives off-center hits");
  if (skillScore >= 8) reasons.push(`Suitable for ${playerLevel.toLowerCase()} players`);
  if (styleScore >= 7) reasons.push(`Matches your ${player.playStyle.toLowerCase().replace("_", "-")} play style`);
  if (reasons.length === 0) reasons.push("Balanced fit across your current stats");

  return { matchPercent, reasons };
}

export function recommendPaddles(paddles, player) {
  const needs = derivePlayerNeeds(player.stats);
  const scored = paddles.map((paddle) => {
    const { matchPercent, reasons } = scorePaddle(paddle, needs, player);
    return { paddle, matchPercent, reasons };
  });
  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  return { needs, recommendations: scored };
}
