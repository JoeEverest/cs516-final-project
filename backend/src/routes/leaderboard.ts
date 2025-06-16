import express from "express";
import {
  createLeaderboardEntryController,
  getLeaderboardController,
} from "../controllers/leaderboard";

const router = express.Router();

// POST /leaderboard - Create new entry
router.post("/", createLeaderboardEntryController);

// GET /leaderboard - Get all entries (optionally filtered by topicId)
router.get("/", getLeaderboardController);

export default router;
