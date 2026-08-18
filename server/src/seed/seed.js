// One-off seed script: populates the Drill and Paddle catalogs so the
// training-plan and paddle-recommendation features have real data to match
// against. Run with `npm run seed` after setting MONGODB_URI.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Drill from "../models/Drill.js";
import Paddle from "../models/Paddle.js";

const drills = [
  // Third shot drop
  { name: "Crosscourt Third Shot Drop", category: "THIRD_SHOT_DROP", statKey: "thirdShotDrop", difficulty: "INTERMEDIATE", durationMinutes: 15, requiredPlayers: 2, target: "Consistency", instructions: ["Stand at the baseline, partner at the kitchen line.", "Hit 20 crosscourt drops aiming for the kitchen.", "Reset and repeat, tracking makes vs. attempts."] },
  { name: "Middle Third Shot Drop", category: "THIRD_SHOT_DROP", statKey: "thirdShotDrop", difficulty: "INTERMEDIATE", durationMinutes: 15, requiredPlayers: 2, target: "Placement", instructions: ["Same setup as crosscourt drop.", "Aim 20 drops down the middle instead.", "Focus on soft hands and a low arc."] },
  { name: "Transition Drop & Advance", category: "THIRD_SHOT_DROP", statKey: "thirdShotDrop", difficulty: "ADVANCED", durationMinutes: 20, requiredPlayers: 2, target: "Movement", instructions: ["Hit a drop, then take two steps forward toward the kitchen.", "Repeat 20 times, alternating crosscourt and middle.", "Goal: arrive at the kitchen line in control, not rushed."] },

  // Third shot drive
  { name: "Drive Depth Ladder", category: "THIRD_SHOT_DRIVE", statKey: "thirdShotDrive", difficulty: "INTERMEDIATE", durationMinutes: 15, requiredPlayers: 2, target: "Depth control", instructions: ["Hit 15 drives aiming past the opponent's kitchen line.", "Track how many land in the back third of the court.", "Increase pace only once depth is consistent."] },

  // Dink
  { name: "Crosscourt Dink Rally", category: "DINK", statKey: "dink", difficulty: "BEGINNER", durationMinutes: 10, requiredPlayers: 2, target: "Consistency", instructions: ["Both players at the kitchen line, crosscourt only.", "Rally dinks, resetting after any error.", "Aim for a rally of 20+ before adding pace variation."] },
  { name: "Straight-Ahead Dink Precision", category: "DINK", statKey: "dink", difficulty: "INTERMEDIATE", durationMinutes: 12, requiredPlayers: 2, target: "Placement", instructions: ["Dink straight ahead, targeting a specific quadrant of the kitchen.", "Call the target zone out loud before each shot.", "Track hit rate on called targets."] },

  // Reset / transition
  { name: "Baseline-to-Kitchen Reset Drill", category: "RESET", statKey: "reset", difficulty: "INTERMEDIATE", durationMinutes: 15, requiredPlayers: 2, target: "Transition consistency", instructions: ["Partner feeds hard drives from the kitchen.", "Practice resetting each ball softly into the kitchen.", "Take one step forward after every successful reset."] },
  { name: "Speed-Up Recovery Reset", category: "RESET", statKey: "reset", difficulty: "ADVANCED", durationMinutes: 15, requiredPlayers: 2, target: "Reaction & reset under pressure", instructions: ["Partner randomly speeds up shots during a dink rally.", "Reset each speed-up with a soft, controlled shot.", "Track successful resets out of 15 speed-ups."] },

  // Serve
  { name: "Deep Serve Targets", category: "SERVE", statKey: "serve", difficulty: "BEGINNER", durationMinutes: 10, requiredPlayers: 1, target: "Depth & consistency", instructions: ["Place a target within 2 feet of the baseline.", "Serve 20 balls aiming for the target.", "Track how many land in the back third of the service box."] },
  { name: "Serve Placement Variation", category: "SERVE", statKey: "serve", difficulty: "INTERMEDIATE", durationMinutes: 12, requiredPlayers: 1, target: "Placement variety", instructions: ["Alternate serves between the backhand corner and body.", "10 reps per target, tracking success rate per zone."] },

  // Return
  { name: "Deep Return Consistency", category: "RETURN", statKey: "return", difficulty: "BEGINNER", durationMinutes: 12, requiredPlayers: 2, target: "Depth", instructions: ["Partner serves, you return deep every time.", "Track how many returns land past the midline.", "Follow every return with a move toward the kitchen."] },

  // Volley
  { name: "Punch Volley Reps", category: "VOLLEY", statKey: "volley", difficulty: "INTERMEDIATE", durationMinutes: 10, requiredPlayers: 2, target: "Contact consistency", instructions: ["Partner feeds volleys from mid-court.", "Punch volley each ball back with minimal backswing.", "20 reps, tracking clean contact vs. mishits."] },
];

const paddles = [
  { brand: "Selkirk", model: "Power Air Invikta", price: 219, weightOz: 7.8, power: 9, control: 5, spin: 7, sweetSpot: 6, playerLevel: "ADVANCED", usapApproved: true },
  { brand: "Selkirk", model: "Luxx Control Air", price: 219, weightOz: 7.6, power: 5, control: 9, spin: 7, sweetSpot: 8, playerLevel: "INTERMEDIATE", usapApproved: true },
  { brand: "Paddletek", model: "Bantam EX-L", price: 189, weightOz: 7.9, power: 7, control: 7, spin: 6, sweetSpot: 7, playerLevel: "INTERMEDIATE", usapApproved: true },
  { brand: "JOOLA", model: "Perseus", price: 199, weightOz: 8.0, power: 8, control: 6, spin: 8, sweetSpot: 6, playerLevel: "ADVANCED", usapApproved: true },
  { brand: "JOOLA", model: "Vision CFS 16", price: 179, weightOz: 7.7, power: 6, control: 8, spin: 6, sweetSpot: 8, playerLevel: "BEGINNER", usapApproved: true },
  { brand: "Engage", model: "Pursuit EX", price: 169, weightOz: 7.9, power: 6, control: 8, spin: 5, sweetSpot: 9, playerLevel: "BEGINNER", usapApproved: true },
  { brand: "Engage", model: "Poach Advantage", price: 179, weightOz: 8.0, power: 7, control: 7, spin: 6, sweetSpot: 7, playerLevel: "INTERMEDIATE", usapApproved: true },
  { brand: "CRBN", model: "1X Power", price: 199, weightOz: 8.1, power: 9, control: 5, spin: 7, sweetSpot: 5, playerLevel: "ADVANCED", usapApproved: true },
  { brand: "Gearbox", model: "CX14E", price: 249, weightOz: 7.9, power: 7, control: 7, spin: 9, sweetSpot: 6, playerLevel: "ADVANCED", usapApproved: true },
  { brand: "Franklin", model: "Signature Pro", price: 149, weightOz: 7.8, power: 5, control: 7, spin: 5, sweetSpot: 8, playerLevel: "BEGINNER", usapApproved: true },
];

async function run() {
  await connectDB();
  await Drill.deleteMany({});
  await Paddle.deleteMany({});
  await Drill.insertMany(drills);
  await Paddle.insertMany(paddles);
  console.log(`Seeded ${drills.length} drills and ${paddles.length} paddles.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
