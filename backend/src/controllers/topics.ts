/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../dynamoClient";

export const getTopics = async (req: Request, res: Response) => {
  try {
    const params = { TableName: "Topic" };
    const result: any = await dynamoDB.send(new ScanCommand(params));
    const topics =
      result.Items?.map((item: any) => ({
        id: item.id.S,
        name: item.name.S,
      })) || [];

    res.status(200).json({ topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};
