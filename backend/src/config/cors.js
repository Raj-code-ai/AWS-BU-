const cors = require('cors');
const env = require('./env');
const AppError = require('../utils/AppError');

function normalizeOrigin(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

function matchesHttpsHostSuffix(rule, normalized, suffix) {
  if (rule !== `https://*.${suffix}` && rule !== `*.${suffix}`) return false;
  try {
    const url = new URL(normalized);
    return url.protocol === 'https:' && url.hostname.endsWith(`.${suffix}`);
  } catch (_) {
    return false;
  }
}

function isAllowedOrigin(origin, allowedList) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  for (const raw of allowedList) {
    const rule = normalizeOrigin(raw);
    if (!rule) continue;

    if (rule === normalized) return true;

    // Host wildcards for preview and production frontends.
    if (matchesHttpsHostSuffix(rule, normalized, 'vercel.app')) return true;
    if (matchesHttpsHostSuffix(rule, normalized, 'amplifyapp.com')) return true;
  }

  return false;
}

function createCorsMiddleware() {
  const allowedList = (env.corsOrigins || []).map(normalizeOrigin).filter(Boolean);

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (isAllowedOrigin(origin, allowedList)) {
        return callback(null, true);
      }

      return callback(
        new AppError(`CORS blocked for origin: ${origin}`, 403, 'CORS_FORBIDDEN')
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-Id',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
  });
}

module.exports = { createCorsMiddleware, isAllowedOrigin, normalizeOrigin };
