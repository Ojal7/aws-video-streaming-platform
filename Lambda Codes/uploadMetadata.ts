import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("S3 event received:", JSON.stringify(event, null, 2));

  const record = event.Records?.[0];
  if (!record) {
    return { statusCode: 400, body: "No S3 record found" };
  }

  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

  // const bucket = "video-upload-storage-ojal";
  // const key = "d1ab3c09-6a84-4930-b553-75dbeef8a1d7-Test.mp4"; // full path in the bucket


  // Extract basic metadata (you can later use AWS Elastic Transcoder / MediaConvert for deeper metadata)
  const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });

  try {
    const headResult = await s3.send(headCommand);
    
    const videoId = crypto.randomUUID();
    const videoUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
    const title = key.split("/").pop() || "Untitled";
    const description = "Uploaded via S3 event";

    const item = {
      videoId,
      title,
      description,
      videoUrl,
      views: 0,
      contentType: headResult.ContentType,
      uploadedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: "Videos",
      Item: item
    });

    await dynamo.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Metadata saved", item }),
    };
  } catch (err) {
    console.error("Error processing S3 event:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to process S3 upload", error: err.message }),
    };
  }
};
