import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
  let body;

  try {
    const isApiGateway = typeof event.body === 'string';
    body = isApiGateway ? JSON.parse(event.body) : event;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON input' })
    };
  }

  const { videoId } = body;

  if (!videoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing videoId field' })
    };
  }

  const command = new UpdateCommand({
    TableName: 'Videos',
    Key: { videoId },
    UpdateExpression: 'SET #views = if_not_exists(#views, :zero) + :val',
    ExpressionAttributeNames: {
      '#views': 'views', // Use placeholder for the reserved keyword
    },
    ExpressionAttributeValues: {
      ':val': 1,
      ':zero': 0
    },
    ReturnValues: 'ALL_NEW'
  });

  try {
    const result = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Views updated successfully',
        updatedItem: result.Attributes
      })
    };
  } catch (error) {
    console.error('DynamoDB error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update views', error: error.message })
    };
  }
};
