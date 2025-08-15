import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "YAKIATJBWOGPMOYKNAOGW",
    secretAccessKey: "PFa+C5yPNi8tJzwyQT+rArTVgpU+8rp2mH1qzf3Y",
  },
});

async function test() {
  try {
    const resp = await client.send(new ScanCommand({ TableName: "Todo" }));
    console.log("Success:", resp.Items);
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
