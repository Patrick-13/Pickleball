import mongoose from "mongoose";

// Player is the pickleball profile tied 1:1 to a User account.
// Ratings and stats are derived from recorded games, not self-entered.
const playerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    preferredHand: { type: String, enum: ["LEFT", "RIGHT"], default: "RIGHT" },
    playStyle: {
      type: String,
      enum: ["AGGRESSIVE", "DEFENSIVE", "BALANCED", "COUNTER_ATTACKER"],
      default: "BALANCED",
    },
    currentPaddle: { type: mongoose.Schema.Types.ObjectId, ref: "Paddle", default: null },

    ratings: {
      appRating: { type: Number, default: 2.5 },
      singles: { type: Number, default: 2.5 },
      doubles: { type: Number, default: 2.5 },
      duprRating: { type: Number, default: null },
      selfRating: { type: Number, default: null },
    },

    // Aggregated, derived stats — recomputed whenever a game is recorded.
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      pointsWon: { type: Number, default: 0 },
      pointsLost: { type: Number, default: 0 },
      currentWinStreak: { type: Number, default: 0 },
      currentLossStreak: { type: Number, default: 0 },
      longestWinStreak: { type: Number, default: 0 },
      longestLossStreak: { type: Number, default: 0 },

      // Advanced (optional) stats, aggregated only when a game includes them.
      serve: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      return: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      dink: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      thirdShotDrop: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      thirdShotDrive: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      volley: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      reset: { attempted: { type: Number, default: 0 }, successful: { type: Number, default: 0 } },
      errors: { type: Map, of: Number, default: {} }, // e.g. { BACKHAND_ERROR: 4 }
    },
  },
  { timestamps: true }
);

playerSchema.virtual("winRate").get(function () {
  return this.stats.gamesPlayed ? Math.round((this.stats.wins / this.stats.gamesPlayed) * 1000) / 10 : 0;
});
playerSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Player", playerSchema);
