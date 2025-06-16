import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

interface LeaderboardEntry {
  id: string;
  userId: string;
  topicId: string;
  score: number;
  duration: number;
  createdAt: string;
}

export const createLeaderboardEntry = async (
  entry: Omit<LeaderboardEntry, "id" | "createdAt">,
): Promise<LeaderboardEntry> => {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  const params = {
    TableName: "Leaderboard",
    Item: {
      id: { S: id },
      userId: { S: entry.userId },
      topicId: { S: entry.topicId },
      score: { N: entry.score.toString() },
      duration: { N: entry.duration.toString() },
      createdAt: { S: createdAt },
    },
  };

  await dynamoDB.send(new PutItemCommand(params));

  return { id, ...entry, createdAt };
};

export const getLeaderboardEntries = async (
  topicId?: string,
): Promise<LeaderboardEntry[]> => {
  const params: {
    TableName: string;
    FilterExpression?: string;
    ExpressionAttributeValues?: Record<string, { S: string }>;
  } = {
    TableName: "Leaderboard",
  };

  if (topicId) {
    params.FilterExpression = "topicId = :topicId";
    params.ExpressionAttributeValues = {
      ":topicId": { S: topicId },
    };
  }

  const result = await dynamoDB.send(new ScanCommand(params));

  const entries = (result.Items || []).map((item) => ({
    id: item.id.S!,
    userId: item.userId.S!,
    topicId: item.topicId.S!,
    score: parseInt(item.score.N!),
    duration: parseInt(item.duration.N!),
    createdAt: item.createdAt.S!,
  }));

  // Sort by score (highest first), then by duration (fastest first)
  entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.duration - b.duration;
  });

  return entries;
};
