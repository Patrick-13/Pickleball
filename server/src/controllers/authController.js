import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import Player from "../models/Player.js";
import Paddle from "../models/Paddle.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    const player = await Player.create({ user: user._id });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
      player,
    });
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: err.errors[0].message });
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    const player = await Player.findOne({ user: user._id });
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }, player });
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: err.errors[0].message });
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    const player = await Player.findOne({ user: req.userId }).populate("currentPaddle");
    res.json({ user, player });
  } catch (err) {
    next(err);
  }
}
