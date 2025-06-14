import { Router } from "express";
import { createLeaderboard, getLeaderboard } from "../controllers/leaderboard";

export const leaderBoardRoutes = Router();

leaderBoardRoutes.post("/", createLeaderboard);
leaderBoardRoutes.get("/", getLeaderboard);
