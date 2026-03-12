import pino from 'pino';

// Always emit newline-delimited JSON.
// In development, pipe stdout through pino-pretty via the dev script instead
// of using a worker-thread transport, which can be silently swallowed by tsx.
const logger = pino({
  // Respect LOG_LEVEL env var; default to 'info' in production, 'debug' elsewhere.
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
});

export default logger;
