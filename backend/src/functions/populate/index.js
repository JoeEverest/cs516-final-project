import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { topicsData } from "./topicsData.js";
import { questionBank } from "./questionBank.js";
import { uuidv4 } from "./uuid.js";

const dynamoDB = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
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

    console.log("topics: ", topics);
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

      // await dynamoDB.send(new PutItemCommand(questionParams));
      console.log("questionParams: ", questionParams);

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
