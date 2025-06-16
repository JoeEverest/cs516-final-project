/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../dynamoClient";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const params = { TableName: "User" };
    const result: any = await dynamoDB.send(new ScanCommand(params));

    const users =
      result.Items?.map((item: any) => ({
        id: item.id.S,
        name: item.name?.S || "",
        email: item.email?.S || "",
      })) || [];

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
