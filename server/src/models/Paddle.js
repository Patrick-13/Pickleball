import mongoose from "mongoose";

// Minimal paddle catalog for the MVP profile screen (full recommendation engine is V2/V3).
const paddleSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    price: Number,
    weightOz: Number,
    power: { type: Number, min: 1, max: 10 },
    control: { type: Number, min: 1, max: 10 },
    spin: { type: Number, min: 1, max: 10 },
    sweetSpot: { type: Number, min: 1, max: 10 },
    playerLevel: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"], default: "INTERMEDIATE" },
    usapApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Paddle", paddleSchema);
