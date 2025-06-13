import { Request, Response } from "express";
import { PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDB } from "../../dynamoClient";
import { topics } from "../data/topics";

export const createQuestion = async (req: Request, res: Response) => {
  const { topicId, question, answers, correctAnswer } = req.body;
  const id = uuidv4(); // Generate unique ID

  const params = {
    TableName: "Question",
    Item: {
      id: { S: id },
      topicId: { S: topicId },
      question: { S: question },
      answers: {
        L: answers.map((answer: any) => ({ S: answer })),
      },
      correctAnswer: { S: correctAnswer },
    },
  };

  try {
    await dynamoDB.send(new PutItemCommand(params));
    res.status(200).json({ message: "Saved to DynamoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DynamoDB write failed" });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  const { topicId } = req.params;

  try {
    const params = {
      TableName: "Question",
      Limit: 5,
      FilterExpression: "topicId = :topicIdVal",
      ExpressionAttributeValues: {
        ":topicIdVal": { S: topicId },
      },
    };

    const data: any = await dynamoDB.send(new ScanCommand(params));

    // Convert DynamoDB format to plain JSON
    const questions = data.Items.map((item: any) => ({
      id: item.id.S,
      topicId: item.topicId.S,
      question: item.question.S,
      answers: item.answers.L.map((ans: any) => ans.S),
      correctAnswer: item.correctAnswer.S,
    }));
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

export const populateData = async (req: Request, res: Response) => {
  for (const topic of topics) {
    const params: any = {
      TableName: "Topic",
      Item: {
        id: { S: uuidv4() },
        name: { S: topic },
      },
    };

    try {
      await dynamoDB.send(new PutItemCommand(params));
      res.status(200).json({ message: "Saved topic to DynamoDB" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DynamoDB write failed" });
    }
  }
};
