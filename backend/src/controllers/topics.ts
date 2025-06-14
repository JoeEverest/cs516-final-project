import { Request, Response } from "express";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../dynamoClient";

export const getTopics = async (req: Request, res: Response) => {
  try {
    const params = { TableName: "Topic" };
    const topics: any = await dynamoDB.send(new ScanCommand(params));
    res.status(200).json({ topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};
