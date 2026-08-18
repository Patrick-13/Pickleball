import Drill from "../models/Drill.js";

// Maps a player's overall level to a difficulty ceiling, so a 2.5-rated
// player doesn't get handed advanced drills (doc section 16, "filter by skill level").
function difficultyCeiling(appRating) {
  if (appRating < 3.0) return ["BEGINNER", "INTERMEDIATE"];
  if (appRating < 4.0) return ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  return ["INTERMEDIATE", "ADVANCED"];
}

// Turns a Level-Up priority list (see utils/stats.js) into an actual training
// plan: for each weak skill, pull 2-3 matching drills at an appropriate level.
export async function buildTrainingPlan(levelUp, appRating) {
  const allowedDifficulties = difficultyCeiling(appRating);

  const plan = [];
  for (const item of levelUp) {
    const drills = await Drill.find({
      statKey: item.key,
      difficulty: { $in: allowedDifficulties },
    }).limit(3);

    plan.push({
      priority: item.priority,
      rank: item.rank,
      skill: item.skill,
      key: item.key,
      current: item.current,
      target: item.target,
      drills,
    });
  }
  return plan;
}
