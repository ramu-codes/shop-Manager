/**
 * Validates required environment variables after dotenv is loaded.
 * Parses CLIENT_URL as a comma-separated list of allowed CORS origins.
 */

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function validateEnv() {
  const missing = [];
  if (!process.env.MONGO_URI) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

/**
 * @returns {string[]}
 */
export function getAllowedOrigins() {
  const clientUrl = process.env.CLIENT_URL || '';
  const vercelUrl = process.env.VERCEL_URL || '';

  const fromClientEnv = clientUrl
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const fromVercelEnv = vercelUrl ? [`https://${vercelUrl.replace(/^https?:\/\//i, '')}`] : [];

  const list = [...new Set([...fromClientEnv, ...fromVercelEnv, ...DEFAULT_DEV_ORIGINS])];
  return list;
}
