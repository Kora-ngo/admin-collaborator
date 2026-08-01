import { S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

if (!process.env.B2_ENDPOINT)        throw new Error("B2_ENDPOINT is missing");
if (!process.env.B2_KEY_ID)          throw new Error("B2_KEY_ID is missing");
if (!process.env.B2_APPLICATION_KEY) throw new Error("B2_APPLICATION_KEY is missing");
if (!process.env.B2_BUCKET_NAME)     throw new Error("B2_BUCKET_NAME is missing");

export const storageClient = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION || "us-west-004",
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY,
    },
    forcePathStyle: true, // Required for Backblaze B2
});

export const BUCKET_NAME = process.env.B2_BUCKET_NAME;