import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  APP_URL: z.string().url(),
  WEB_URL: z.string().url(),
  API_URL: z.string().url(),
  MONGODB_URI: z.string().min(10),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('CineForge AI <noreply@example.com>'),
  UPI_ID: z.string().optional().default(''),
  UPI_NAME: z.string().optional().default('CineForge AI'),
  PDF_SECURE_STORAGE_PATH: z.string().optional().default('./storage/private')
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === 'production';

