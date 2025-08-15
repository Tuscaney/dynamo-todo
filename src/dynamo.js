import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

const TABLE_NAME = "Todo"; // DynamoDB table name

// Base client with credentials (browser demo only)
const baseClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Wrap it for JS objects
const ddb = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export async function scanTodos() {
  const resp = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  return resp.Items ?? [];
}

export async function createTodo(item) {
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

