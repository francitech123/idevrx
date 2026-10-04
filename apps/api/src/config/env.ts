import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().default('localhost'),
  FRONTEND_URL: z.string().url(),
  APP_BASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Storage — provider-switchable
  STORAGE_PROVIDER: z.enum(['upstash', 'b2', 'r2', 's3', 'local']).default('upstash'),
  STORAGE_BUCKET: z.string().min(1),

  // Upstash Blob (used when STORAGE_PROVIDER=upstash)
  UPSTASH_BLOB_TOKEN: z.string().optional(),

  // S3-family (used when STORAGE_PROVIDER is b2/r2/s3)
  STORAGE_REGION: z.string().optional(),
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_PUBLIC_URL: z.string().default(''),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';

// Provider-specific validation with clear errors
if (env.STORAGE_PROVIDER === 'upstash' && !env.UPSTASH_BLOB_TOKEN) {
  console.error('❌ STORAGE_PROVIDER=upstash requires UPSTASH_BLOB_TOKEN');
  process.exit(1);
}

if (
  (env.STORAGE_PROVIDER === 'b2' ||
    env.STORAGE_PROVIDER === 'r2' ||
    env.STORAGE_PROVIDER === 's3') &&
  (!env.STORAGE_REGION || !env.STORAGE_ENDPOINT || !env.STORAGE_ACCESS_KEY || !env.STORAGE_SECRET_KEY)
) {
  console.error(
    `❌ STORAGE_PROVIDER=${env.STORAGE_PROVIDER} requires STORAGE_REGION, STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY`
  );
  process.exit(1);
}
