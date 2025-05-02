# aws-video-streaming-platform
A serverless video streaming platform built on AWS. It enables users to upload and view videos, with real-time view tracking. Utilizes AWS Lambda, S3, API Gateway, DynamoDB, and CloudFront for secure video hosting and metadata storage. The frontend is a simple HTML page served globally via CloudFront.

# Serverless Video Streaming Platform

A fully serverless video streaming platform built on AWS. The application allows users to upload videos, view available content, and track real-time video views. It utilizes AWS services such as Lambda, S3, API Gateway, CloudFront, DynamoDB, and IAM to provide scalable and secure video hosting, metadata storage, and streaming capabilities. This project features a simple HTML frontend hosted on S3 and served globally via CloudFront, enabling smooth video playback and view tracking.

## 🚀 Technologies Used

- **AWS S3** – Storage for uploaded videos and frontend files
- **AWS Lambda (Node.js 22.x runtime)** – Backend compute logic
- **AWS API Gateway** – RESTful API interface
- **AWS CloudFront** – CDN for frontend hosting
- **AWS IAM** – Permissions and access control
- **AWS DynamoDB** – NoSQL storage for video metadata

---

## 🧠 Architecture Overview



---

## 🛠 Lambda Functions

### `uploadMetadata`

- **Trigger**: S3 event (`s3:ObjectCreated:*`) on `video-upload-storage-ojal` bucket.
- **Purpose**: 
  - Extracts metadata from uploaded video files.
  - Generates a unique `videoId`.
  - Stores metadata (title, description, content type, URL, timestamp) in the `Videos` DynamoDB table.
- **Additional Info**:
  - S3 invokes this function using the `trigger-metadata-lambda` event.
  - S3 permissions are granted to allow invocation.

### `GeneratePreSignedUrl`

- **Purpose**:
  - Accepts `fileName` and `contentType` via POST request.
  - Returns a presigned S3 URL for direct upload (expires in 1 hour).
  - Constructs a unique object key using UUID.
- **Integration**:
  - Proxy integration is enabled in API Gateway for dynamic request/response handling.

### `incrementViews`

- **Purpose**:
  - Receives a `videoId` and increments the `views` count in DynamoDB.
  - Initializes view count to 0 if it does not exist.
- **Error Handling**:
  - Returns a 400 error for invalid/missing input.
  - Logs and returns a 500 error on update failures.

### `listVideos`

- **Purpose**:
  - Returns a list of all videos from the DynamoDB `Videos` table.
  - Supports pagination using `lastEvaluatedKey` via query parameters.

---

## 🌐 API Gateway

Four endpoints were created to expose the Lambda functions as RESTful APIs:

| Endpoint Path              | Method | Lambda Function       | CORS Enabled |
|---------------------------|--------|------------------------|--------------|
| `/uploadMetadata`         | POST   | `uploadMetadata`       | ✅           |
| `/generatePreSignedUrl`   | POST   | `GeneratePreSignedUrl` | ✅           |
| `/incrementViews`         | POST   | `incrementViews`       | ✅           |
| `/listVideos`             | GET    | `listVideos`           | ✅           |

- All methods use **Lambda Function Integration**.
- **CORS** enabled for cross-origin requests.
- Proxy integration is enabled only for `GeneratePreSignedUrl`.

---

## 🗄 DynamoDB Configuration

- **Table Name**: `Videos`
- **Primary Key**: `videoId` (String)
- **Attributes**:
  - `title`, `description`, `url`, `views`, `contentType`, `timestamp`
- **IAM Permissions**:
  - `PutItem`, `GetItem`, `UpdateItem`, `Scan` granted to Lambda role.

---

## 🧺 S3 Buckets

### 1. `video-upload-storage-ojal`

- **Purpose**: Stores uploaded video content.
- **Configuration**:
  - Public access enabled via bucket policy.
  - S3 trigger invokes `uploadMetadata` Lambda.
  - **CORS Configuration**:
    ```json
    [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "GET", "POST"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
    ```

- **Bucket Policy**:
  This policy grants public read access to the uploaded video files.

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::video-upload-storage-ojal/*"
        }
      ]
    }
    ```

### 2. `video-stream-frontend`

- **Purpose**: Hosts the frontend HTML (`index.html`).
- **Setup**:
  - Static website hosting enabled.
  - Integrated with **CloudFront** for global delivery.
  - Bucket policy updated manually to grant CloudFront access.

---

## 🌍 CloudFront

- **Origin**: `video-stream-frontend` S3 bucket
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Origin Access Control (OAC)**: Configured to restrict direct access to S3
- **Default Root Object**: `index.html`
- **WAF**: Not enabled (optional)

---

## 📦 Deployment Summary

- **Frontend**: Deployed on CloudFront using S3 static website hosting.
- **Backend**: 4 Lambda functions integrated with API Gateway for upload, listing, and view tracking.
- **Storage**: Videos on S3, metadata on DynamoDB.
- **Security**: IAM roles restrict access to S3 and DynamoDB; CORS ensures safe cross-origin interactions.

---

## 📸 Screenshots (Optional)

> Include screenshots or a demo GIF here if available to show the app interface and API usage.

---

## 📄 License

MIT License - [Your Name or Organization]

---

## 🙌 Acknowledgements

Special thanks to AWS documentation and the open-source community for guidance and best practices.

