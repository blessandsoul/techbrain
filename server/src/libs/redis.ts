import { Redis } from 'ioredis';
import { env } from '@config/env.js';
import { logger } from '@libs/logger.js';

let redis: Redis | null = null;
const MAX_STARTUP_WAIT_MS = 5_000;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: env.REDIS_MAX_RETRIES,
      connectTimeout: env.REDIS_CONNECT_TIMEOUT,
      // Startup and requests must fail open to the in-memory rate-limit store
      // instead of waiting on commands queued for an unready Redis socket.
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        // Exponential backoff with max delay of 3 seconds
        if (times > env.REDIS_MAX_RETRIES) {
          // Stop retrying after max retries
          logger.error('[REDIS] Max retries reached, giving up');
          return null;
        }
        const delay = Math.min(times * 50, 3000);
        logger.debug(`[REDIS] Retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
    });

    redis.on('connect', () => {
      logger.info('[REDIS] Connection established');
    });

    redis.on('error', (error: Error) => {
      logger.warn({ err: error }, '[REDIS] Connection error');
    });

    redis.on('reconnecting', (delay: number) => {
      logger.info({ delay }, '[REDIS] Reconnecting');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<boolean> {
  let startupTimer: ReturnType<typeof setTimeout> | undefined;

  try {
    const client = getRedis();
    const startupWaitMs = Math.min(env.REDIS_CONNECT_TIMEOUT, MAX_STARTUP_WAIT_MS);

    await Promise.race([
      client.connect(),
      new Promise<never>((_resolve, reject) => {
        startupTimer = setTimeout(
          () => reject(new Error(`Redis readiness timed out after ${startupWaitMs}ms`)),
          startupWaitMs,
        );
      }),
    ]);
    return true;
  } catch (error) {
    // Stop the pending connection/retry cycle. The application intentionally
    // continues with its in-memory fallbacks when Redis is unavailable.
    redis?.disconnect(false);
    logger.warn('[REDIS] Connection failed — server will start without Redis');
    logger.debug(error);
    return false;
  } finally {
    if (startupTimer) clearTimeout(startupTimer);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('[REDIS] Disconnected');
  }
}
