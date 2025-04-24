  // cloudinary.utils.js

  import dotenv from "dotenv";
  dotenv.config();

  import { v2 as cloudinary } from "cloudinary";
  import streamifier from "streamifier";

  // Cloudinary configuration
  cloudinary.config({
    cloud_name: 'dto9wrjty',
    api_key: '566172297763764',
    api_secret: process.env.API_SECRET,
  });

  // Upload image using a stream
  export const uploadToCloudinary = (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: fileName,
          folder: 'expenses',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  };

  // Optional utility (you may not need this if using secure_url directly)
  export const getOptimizedUrl = (publicId) => {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      secure: true,
    });
  };
