import { v2 as cloudinary } from "cloudinary";

function configure() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      ok: false as const,
      error:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { ok: true as const, cloudinary };
}

export function getCloudinary() {
  return configure();
}

export function createUploadSignature(options?: {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
}) {
  const config = configure();
  if (!config.ok) return config;

  const timestamp = Math.round(Date.now() / 1000);
  const folder = options?.folder || "techup";
  const params = {
    timestamp,
    folder,
  };

  const signature = config.cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    ok: true as const,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    folder,
    signature,
    resourceType: options?.resourceType || "auto",
  };
}
