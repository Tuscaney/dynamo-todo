import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// Environment variables from .env.local
const REGION = import.meta.env.VITE_AWS_REGION || "us-east-2";
const ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

const TABLE_NAME = "Todo";

// Logging toggle (set to false in production)
const DEBUG = true;

// Warn if env vars are missing
if (!REGION) console.error("⚠️ AWS REGION is missing!");
if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error("⚠️ AWS credentials are missing!");
}

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// DynamoDB Document client (handles marshalling/unmarshalling)
const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * Fetch all todos from DynamoDB
 * @returns {Promise<Array>} Array of todo items
 */
export async function scanTodos() {
  try {
    const resp = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
    if (DEBUG) console.log("Scan response:", resp);
    return resp.Items ?? [];
  } catch (err) {
    console.error("Error scanning todos:", err);
    return [];
  }
}

/**
 * Create a new todo
 * @param {Object} item - Todo object { id, title, completed }
 * @returns {Promise<Object>} Created todo item
 */
export async function createTodo(item) {
  if (!item?.id || !item?.title) {
    throw new Error("Todo must have an id and title");
  }

  try {
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    if (DEBUG) console.log("Created todo:", item);
    return item;
  } catch (err) {
    console.error("Error creating todo:", err);
    throw err;
  }
}

/**
 * Toggle a todo's completed status
 * @param {string} id - Todo id
 * @param {boolean} completed - New completed value
 * @returns {Promise<Object>} Updated todo item
 */
export async function toggleTodo(id, completed) {
  if (!id) throw new Error("Todo id is required");

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
    if (DEBUG) console.log(`Toggled todo ${id}:`, resp.Attributes);
    return resp.Attributes;
  } catch (err) {
    console.error(`Error toggling todo ${id}:`, err);
    throw err;
  }
}

/**
 * Delete a todo by id
 * @param {string} id - Todo id
 * @returns {Promise<string>} Deleted todo id
 */
export async function deleteTodo(id) {
  if (!id) throw new Error("Todo id is required");

  try {
    const params = { TableName: TABLE_NAME, Key: { id } };
    await ddb.send(new DeleteCommand(params));
    if (DEBUG) console.log(`Deleted todo ${id}`);
    return id;
  } catch (err) {
    console.error(`Error deleting todo ${id}:`, err);
    throw err;
  }
}
