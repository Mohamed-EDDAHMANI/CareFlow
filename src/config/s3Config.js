
import { Client } from "minio";

// Internal client for operations (upload, delete, etc.)
export const s3 = new Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    region: "us-east-1",
    pathStyle: true
});

// Public client for generating presigned URLs with correct signature
export const s3Public = new Client({
    endPoint: process.env.MINIO_PUBLIC_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    region: "us-east-1",
    pathStyle: true
});

export const BUCKET_NAME = process.env.MINIO_BUCKET || "documents";


export const initMinio = async () => {
  try {
    const exists = await s3.bucketExists(BUCKET_NAME);
    if (!exists) {
      await s3.makeBucket(BUCKET_NAME, "us-east-1");
      console.log(`🪣 Bucket "${BUCKET_NAME}" créé avec succès.`);
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" déjà existant.`);
    }
  } catch (err) {
    console.error("❌ Erreur lors de la vérification du bucket:", err.message);
    process.exit(1);
  }
};


export const getFileUrl = async (fileName) => {
  // Use public client to generate URL with correct signature for browser access
  const url = await s3Public.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60); // 24 hours
  return url;
};