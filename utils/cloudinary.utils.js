//This is cloudinary.utils.js

import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Load environment variables


// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dto9wrjty',
  api_key: '566172297763764',
  api_secret: process.env.API_SECRET,
});

// Utility function to upload an image to Cloudinary using a stream
export const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Automatically detect the type (image, video, etc.)
        public_id: fileName, // Use the passed fileName for the public ID
        folder: 'expenses', // Optional: specify a folder in Cloudinary
      },
      (error, result) => {
        if (error) {
          return reject(error); // Reject the promise on error
        }
        resolve(result); // Resolve the promise with the Cloudinary result
      }
    );

    // Stream the file buffer to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Utility function to get an optimized URL for a Cloudinary image
export const getOptimizedUrl = (publicId) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto', // Automatically fetch the best format
    quality: 'auto', // Automatically adjust the quality
  });
};
