

// utils/digitalOceanSpacesConcerns.utils.js
import dotenv from 'dotenv';
dotenv.config();

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// DigitalOcean S3 client setup
const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

/**
 * Upload a file buffer to DigitalOcean Spaces
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Desired name in the bucket
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Public file URL
 */
export const uploadToDOStorage = async (fileBuffer, fileName, mimeType) => {
  const bucketName = process.env.DO_SPACES_BUCKET || 'vikalpaexamination';
  
  console.log(`🚀 Uploading to DO Spaces: ${fileName}`);
  console.log(`📦 Buffer size: ${(fileBuffer.length / 1024).toFixed(2)}KB`);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `userAttendance/${fileName}`,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  });

  try {
    const startTime = Date.now();
    await s3.send(command);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Upload completed in ${duration}ms`);
    
    // Public URL
    const cdnBase = process.env.DO_SPACES_CDN || `https://${bucketName}.${process.env.DO_SPACES_ENDPOINT.replace('https://', '')}`;
    const fileUrl = `${cdnBase}/userAttendance/${fileName}`;
    
    console.log(`🔗 File URL: ${fileUrl}`);
    return fileUrl;
    
  } catch (error) {
    console.error(`❌ DO Spaces upload failed:`, error);
    throw new Error(`Failed to upload to DigitalOcean Spaces: ${error.message}`);
  }
};