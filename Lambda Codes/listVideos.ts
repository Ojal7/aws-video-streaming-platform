import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const params = {
    TableName: "Videos",
    // Optional: Pagination using exclusive start key
    ExclusiveStartKey: event.queryStringParameters?.lastEvaluatedKey ? JSON.parse(event.queryStringParameters.lastEvaluatedKey) : undefined
  };

  try {
    const data = await docClient.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: data.Items,
        lastEvaluatedKey: data.LastEvaluatedKey ? JSON.stringify(data.LastEvaluatedKey) : null
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch videos",
        error: error.message,
      }),
    };
  }
};
