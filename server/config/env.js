/**
 * Validates required environment variables after dotenv is loaded.
 * Parses CLIENT_URL as a comma-separated list of allowed CORS origins.
 */

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/**
 * Convert any URL-like input to a normalized origin:
 * - trims whitespace
 * - removes wrapping quotes
 * - converts to URL origin (scheme + host + port only)
 * - strips trailing slash
 * Returns empty string for invalid input.
 *
 * @param {string} value
 * @returns {string}
 */
export function normalizeOrigin(value) {
  const raw = String(value || '').trim().replace(/^['"]|['"]$/g, '');
  if (!raw) return '';

  try {
    const hasProtocol = /^https?:\/\//i.test(raw);
    const parsed = new URL(hasProtocol ? raw : `https://${raw}`);
    return parsed.origin.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

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
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  const fromVercelEnv = vercelUrl ? [normalizeOrigin(vercelUrl)] : [];

  const defaults = DEFAULT_DEV_ORIGINS.map((origin) => normalizeOrigin(origin)).filter(Boolean);
  const list = [...new Set([...fromClientEnv, ...fromVercelEnv, ...defaults])];
  return list;
}
