import mongoose from "mongoose";

// A single recorded game. Kept deliberately simple to record ("basic" fields),
// with an optional "advanced" block per player for people who want to log detail.
// Per-shot events are intentionally out of scope for the MVP (see doc section 29/30)
// but the schema leaves room to add an `events` array later without breaking this shape.
const advancedStatsSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    serve: { attempted: Number, successful: Number },
    return: { attempted: Number, successful: Number },
    dink: { attempted: Number, successful: Number },
    thirdShotDrop: { attempted: Number, successful: Number },
    thirdShotDrive: { attempted: Number, successful: Number },
    volley: { attempted: Number, successful: Number },
    reset: { attempted: Number, successful: Number },
    errors: { type: Map, of: Number },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    sessionType: {
      type: String,
      enum: ["OPEN_PLAY", "CASUAL_MATCH", "PRACTICE", "DRILL_SESSION", "LEAGUE", "TOURNAMENT"],
      default: "OPEN_PLAY",
    },
    format: { type: String, enum: ["SINGLES", "DOUBLES", "MIXED_DOUBLES"], default: "DOUBLES" },
    scoringType: { type: String, enum: ["TRADITIONAL_SIDE_OUT", "RALLY"], default: "TRADITIONAL_SIDE_OUT" },

    location: { type: String, default: "" },
    date: { type: Date, default: Date.now },

    teamA: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }],
    teamB: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }],
    scoreA: { type: Number, required: true, min: 0 },
    scoreB: { type: Number, required: true, min: 0 },
    winningTeam: { type: String, enum: ["A", "B"], required: true },

    // Optional post-game mood check-in, per player (doc section 12, step 5).
    feelings: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        mood: { type: String, enum: ["GREAT", "GOOD", "AVERAGE", "POOR"] },
      },
    ],

    advancedStats: [advancedStatsSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

gameSchema.pre("validate", function (next) {
  if (this.scoreA === this.scoreB) return next(new Error("Scores cannot be tied"));
  this.winningTeam = this.scoreA > this.scoreB ? "A" : "B";
  next();
});

export default mongoose.model("Game", gameSchema);
