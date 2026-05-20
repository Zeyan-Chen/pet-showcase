import { z } from "zod";

export const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(16),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1)
});

export const parseServerEnv = (env: Record<string, string | undefined>) => {
  return serverEnvSchema.parse(env);
};
