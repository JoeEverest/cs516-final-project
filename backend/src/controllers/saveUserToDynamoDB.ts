import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event: any) => {
  console.log("PostConfirmation event:", JSON.stringify(event, null, 2));

  const userId = event?.userName;
  const email = event?.request?.userAttributes?.email;

  if (!userId || !email) {
    console.error("Missing userId or email in the event object.");
    return event;
  }

  const command = new PutItemCommand({
    TableName: process.env.USER_TABLE_NAME || "User",
    Item: {
      id: { S: userId },
      email: { S: email },
      createdAt: { S: new Date().toISOString() },
    },
  });

  try {
    await client.send(command);
    console.log("✅ User saved to DynamoDB.");
  } catch (err) {
    console.error("❌ Error saving user:", err);
  }

  return event; // Must return the event for Cognito triggers
};
