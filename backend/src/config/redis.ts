import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URI = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

// Safe parse of REDIS_URI to get ioredis connection options
const getRedisClientOpts = (uri: string) => {
  const opts: any = {
    maxRetriesPerRequest: null, // Required by BullMQ
  };
  try {
    const parsed = new URL(uri);
    if (parsed.protocol === 'rediss:') {
      opts.tls = { rejectUnauthorized: false };
    }
  } catch (err) {
    console.warn('[Redis] Client options parsing warning:', err);
  }
  return opts;
};

// General purpose Redis client
export const redisClient = new Redis(REDIS_URI, getRedisClientOpts(REDIS_URI));

export let isRedisOnline = false;

redisClient.on('connect', () => {
  isRedisOnline = true;
  console.log('Redis connected successfully.');
});

redisClient.on('ready', () => {
  isRedisOnline = true;
});

redisClient.on('error', (err) => {
  isRedisOnline = false;
  console.error('Redis connection error (Redis may be offline):', err);
});

redisClient.on('close', () => {
  isRedisOnline = false;
});

// Helper configuration for BullMQ
export const connectionOpts = (() => {
  const opts: any = {
    host: '127.0.0.1',
    port: 6379,
  };
  try {
    const parsed = new URL(REDIS_URI);
    opts.host = parsed.hostname;
    opts.port = parseInt(parsed.port || '6379', 10);
    if (parsed.username) {
      opts.username = parsed.username;
    }
    if (parsed.password) {
      opts.password = decodeURIComponent(parsed.password);
    }
    if (parsed.protocol === 'rediss:') {
      opts.tls = { rejectUnauthorized: false };
    }
  } catch (err) {
    console.warn('[Redis] BullMQ connection options parsing warning:', err);
  }
  return opts;
})();
