import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// Environment variables (from .env.local)
const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

const TABLE_NAME = "Todo"; // DynamoDB table name

// ⚠️ Credentials directly in browser is only for demo. Use Cognito/IAM in real apps.
const baseClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const ddb = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * Fetch all todos
 */
export async function scanTodos() {
  try {
    const resp = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
    return resp.Items ?? [];
  } catch (err) {
    console.error("❌ Error scanning todos:", err);
    return [];
  }
}

/**
 * Create a new todo
 */
export async function createTodo(item) {
  try {
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  } catch (err) {
    console.error("❌ Error creating todo:", err);
    throw err;
  }
}

/**
 * Toggle a todo’s completed status
 */
export async function toggleTodo(id, completed) {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET #completed = :completed",
      ExpressionAttributeNames: { "#completed": "completed" },
      ExpressionAttributeValues: { ":completed": completed },
      ReturnValues: "ALL_NEW",
    };
    const resp = await ddb.send(new UpdateCommand(params));
    return resp.Attributes;
  } catch (err) {
    console.error("❌ Error toggling todo:", err);
    throw err;
  }
}

/**
 * Delete a todo by ID
 */
export async function deleteTodo(id) {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };
    await ddb.send(new DeleteCommand(params));
    return id;
  } catch (err) {
    console.error("❌ Error deleting todo:", err);
    throw err;
  }
}

