import { Request, Response } from "express";
import {
  createLeaderboardEntry,
  getLeaderboardEntries,
} from "../mode/leaderboard";

export const createLeaderboardEntryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, topicId, score, duration } = req.body;

    if (!userId || !topicId || score === undefined || duration === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const entry = await createLeaderboardEntry({
      userId,
      topicId,
      score,
      duration,
    });

    res.status(201).json({
      message: "Leaderboard entry created",
      entry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create leaderboard entry" });
  }
};

export const getLeaderboardController = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.query;

    const entries = await getLeaderboardEntries(topicId as string | undefined);

    res.status(200).json({
      message: "Leaderboard retrieved",
      entries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
};
