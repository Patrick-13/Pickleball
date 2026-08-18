import mongoose from "mongoose";

// Drill database (doc section 16). Each drill is tagged with the skill key(s)
// it targets so the recommendation engine can match a player's weakest skill
// directly to a list of drills, filtered by their level.
const drillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "SERVE", "RETURN", "DINK", "THIRD_SHOT_DROP", "THIRD_SHOT_DRIVE",
        "RESET", "VOLLEY", "OVERHEAD", "LOB", "FOOTWORK", "POSITIONING",
        "COMMUNICATION", "MENTAL",
      ],
    },
    // Maps to the same keys used in Player.stats / stats.js SKILL_LABELS,
    // so a weakness like "thirdShotDrop" resolves straight to matching drills.
    statKey: {
      type: String,
      enum: ["serve", "return", "dink", "thirdShotDrop", "thirdShotDrive", "volley", "reset"],
      required: true,
    },
    difficulty: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "INTERMEDIATE" },
    durationMinutes: { type: Number, default: 15 },
    requiredPlayers: { type: Number, default: 2 },
    target: { type: String, default: "Consistency" },
    instructions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Drill", drillSchema);
