import { Request, Response } from "express";
import {
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDB } from "../../dynamoClient";

export const createLeaderboard = async (req: Request, res: Response) => {
  const { topicId, userId, score, duration } = req.body;
  const id = uuidv4();

  const params = {
    TableName: "Leaderboard",
    Item: {
      id: { S: id },
      topicId: { S: topicId },
      userId: { S: userId },
      score: { N: score.toString() },
      duration: { N: duration.toString() },
    },
  };

  try {
    await dynamoDB.send(new PutItemCommand(params));
    res.status(200).json({ message: "Saved leaderboard to DynamoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DynamoDB write failed" });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  const { topicId } = req.params;

  try {
    // Step 1: Fetch leaderboard entries for the given topicId
    const leaderboardParams = {
      TableName: "Leaderboard",
      FilterExpression: "topicId = :topicIdVal",
      ExpressionAttributeValues: {
        ":topicIdVal": { S: topicId },
      },
    };

    const data = await dynamoDB.send(new ScanCommand(leaderboardParams));

    let leaderboard =
      data.Items?.map((item: any) => ({
        id: item.id.S,
        topicId: item.topicId.S,
        userId: item.userId.S,
        score: Number(item.score.N),
        duration: Number(item.duration.N),
      })) || [];

    // Step 2: Sort for ranking (higher score first, shorter duration if tied)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.duration - b.duration;
    });

    // Step 3: Fetch topic details
    const topicResult = await dynamoDB.send(
      new GetItemCommand({
        TableName: "Topic",
        Key: {
          id: { S: topicId },
        },
      })
    );
    const topic = topicResult.Item
      ? {
          id: topicResult.Item.id.S,
          name: topicResult.Item.name.S,
        }
      : null;

    // Step 4: Fetch user details for each leaderboard entry
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry, index) => {
        let userInfo = null;
        try {
          const userResult = await dynamoDB.send(
            new GetItemCommand({
              TableName: "User",
              Key: {
                id: { S: entry.userId },
              },
            })
          );
          if (userResult.Item) {
            userInfo = {
              id: userResult.Item.id.S,
              name: userResult.Item.name?.S || "",
              email: userResult.Item.email?.S || "",
              // add more fields as needed
            };
          }
        } catch (e) {
          console.warn(`Failed to fetch user ${entry.userId}:`, e);
        }

        return {
          ...entry,
          rank: index + 1,
          user: userInfo,
        };
      })
    );

    // Step 5: Respond
    res.status(200).json({
      topic,
      leaderboard: enrichedLeaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
