import { Request, Response } from "express";
import { PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDB } from "../../dynamoClient";
import { topicsData } from "../data/topicsData";
import { questionBank } from "../data/questionBank";

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

// Received internal server error so, implemented this separately in another lambda
export const populateData = async (req: Request, res: Response) => {
  try {
    const topics = [];

    // Save Topics
    for (const topic of topicsData) {
      const id = uuidv4();
      topics.push({ id, name: topic });

      const topicParams = {
        TableName: "Topic",
        Item: {
          id: { S: id },
          name: { S: topic },
        },
      };

      await dynamoDB.send(new PutItemCommand(topicParams));
    }

    // Save Questions
    for (const question of questionBank) {
      const id = uuidv4();
      const topic = topics.find((t) => t.name === question.topicId);

      if (!topic) {
        console.warn(`No topic found for question: ${question.question}`);
        continue; // skip if topic not matched
      }

      const questionParams = {
        TableName: "Question",
        Item: {
          id: { S: id },
          topicId: { S: topic.id },
          question: { S: question.question },
          answers: {
            L: question.answers.map((answer) => ({ S: answer })),
          },
          correctAnswer: { S: question.correctAnswer },
        },
      };

      try {
        await dynamoDB.send(new PutItemCommand(questionParams));
      } catch (innerErr) {
        console.error("Failed to save question:", question, innerErr);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Topics and questions saved successfully.",
      }),
    };
  } catch (err) {
    console.error("Error saving data:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save data to DynamoDB." }),
    };
  }
};
