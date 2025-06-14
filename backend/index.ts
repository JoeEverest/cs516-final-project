import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { questionRoutes } from "./src/routes/questions";
import { topicRoutes } from "./src/routes/topics";
import { leaderBoardRoutes } from "./src/routes/leaderboard";

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware (if needed for frontend)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/questions", questionRoutes);
app.use("/topics", topicRoutes);
app.use("/leaderboard", leaderBoardRoutes);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  console.log("health");
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// POST /leaderboard - Submit user score
app.post("/leaderboard", async (req: Request, res: Response) => {
  try {
    const { userId, username, topicId, score, totalQuestions, completedAt } =
      req.body;

    // Basic validation
    if (
      !userId ||
      !username ||
      !topicId ||
      score === undefined ||
      !totalQuestions
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId, username, topicId, score, and totalQuestions are required",
      });
    }

    // Validate score
    if (score < 0 || score > totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Invalid score: must be between 0 and total questions",
      });
    }

    // TODO: Replace with actual MongoDB insertion
    const mockLeaderboardEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      username,
      topicId,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      completedAt: completedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // Mock current leaderboard position
    const mockPosition = Math.floor(Math.random() * 100) + 1;

    res.status(201).json({
      success: true,
      message: "Score submitted successfully",
      data: {
        entry: mockLeaderboardEntry,
        position: mockPosition,
        totalEntries: mockPosition + Math.floor(Math.random() * 50),
      },
    });
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit score",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /leaderboard - Get leaderboard (bonus route for testing)
app.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const { topicId, limit = 10 } = req.query;

    // TODO: Replace with actual MongoDB query
    const mockLeaderboard = [
      {
        id: "1",
        userId: "user1",
        username: "johndoe",
        topicId: topicId || "1",
        score: 10,
        totalQuestions: 10,
        percentage: 100,
        completedAt: "2024-01-01T10:00:00Z",
        position: 1,
      },
      {
        id: "2",
        userId: "user2",
        username: "janedoe",
        topicId: topicId || "1",
        score: 9,
        totalQuestions: 10,
        percentage: 90,
        completedAt: "2024-01-01T11:00:00Z",
        position: 2,
      },
      {
        id: "3",
        userId: "user3",
        username: "bobsmith",
        topicId: topicId || "1",
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        completedAt: "2024-01-01T12:00:00Z",
        position: 3,
      },
    ];

    const limitedResults = mockLeaderboard.slice(0, Number(limit));

    res.json({
      success: true,
      data: limitedResults,
      count: limitedResults.length,
      filters: {
        topicId: topicId || "all",
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for AWS Lambda
export const handler = serverless(app);
