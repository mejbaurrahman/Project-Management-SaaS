import { v2 as cloudinary } from "cloudinary";

import config from "../config/index.js";

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

const uploadBuffer = (buffer: Buffer, folder = "taskflow/attachments") => {
  return new Promise<{
    secure_url: string;
    public_id: string;
    resource_type: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("🔥 CLOUDINARY UPLOAD ERROR:", error);

          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

const deleteFile = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export const CloudinaryUtils = {
  uploadBuffer,
  deleteFile,
};
