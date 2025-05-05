import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const s3Client = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "video-upload-storage-ojal";

export const handler = async (event) => {
  console.log("Received event:", event);

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
    console.log("Parsed body:", body);
  } catch (err) {
    console.error("Invalid JSON:", err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: "Invalid JSON input", error: err.message }),
    };
  }

  const { fileName, contentType } = body;

  if (!fileName || !contentType) {
    console.error("Missing fileName or contentType");
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        message: "Missing fileName or contentType",
        received: body,
      }),
    };
  }

  const key = `videos/${crypto.randomUUID()}-${fileName}`;
  console.log("Generated key for file:", key);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    // Log the command being sent to S3
    console.log("Sending PutObjectCommand to S3:", command);
    const preSignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Generated presigned URL:", preSignedUrl);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        preSignedUrl,
        videoUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      }),
    };
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: "Error generating presigned URL", error: err.message }),
    };
  }
};
