// utils/doSpacesTestFiles.utils.js

import dotenv from 'dotenv';
dotenv.config();

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// DigitalOcean S3 client setup
const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT, // e.g., 'https://blr1.digitaloceanspaces.com'
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

/**
 * Upload a test file buffer to DigitalOcean Spaces
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} studentSrn - Student SRN
 * @param {string} examId - Exam ID
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Public file URL
 */
export const uploadTestFileToDOStorage = async (fileBuffer, studentSrn, examId, mimeType) => {
  const bucketName = process.env.DO_SPACES_BUCKET || 'vikalpaexamination';
  
  // Create filename in format: srn_testId.extension
  const fileExtension = mimeType.split('/')[1] || 'pdf';
  const fileName = `${studentSrn}_${examId}.${fileExtension}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `testFiles/${fileName}`,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  });

  await s3.send(command);

  // Public URL
  const fileUrl = `${process.env.DO_SPACES_CDN || `https://${bucketName}.${process.env.DO_SPACES_ENDPOINT.replace('https://', '')}`}/testFiles/${fileName}`;

  return fileUrl;
};