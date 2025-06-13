import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const TABLE_NAME = "my-dynamodb";

export const handler = async (event) => {
  console.log("Trigger Source:", event.triggerSource);
  console.log("Full Event:", JSON.stringify(event, null, 2));

  const triggerSource = event.triggerSource;
  const userAttributes = event.request?.userAttributes;
  const username = event.userName;

  if (!userAttributes || !username) {
    console.warn("Missing userAttributes or username — skipping DynamoDB write.");
    return event;
  }

  const email = userAttributes.email || "unknown";

  if (
    triggerSource === "PostConfirmation_ConfirmSignUp" ||
    triggerSource === "PostConfirmation_ConfirmForgotPassword"
  ) {
    const putCmd = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        username: { S: username },
        email: { S: email },
        createdAt: { S: new Date().toISOString() },
      },
    });

    await dynamo.send(putCmd);
    console.log(`✅ Synced user: ${username} to DynamoDB`);
  }

  return event;
};
