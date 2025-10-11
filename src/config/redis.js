import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

// init function with simple retry/backoff
export async function initRedis({ retries = 10, baseDelay = 500 } = {}) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      attempt++;
      await redisClient.connect();
      return;
    } catch (err) {
      console.warn(`Redis connect attempt ${attempt} failed: ${err.message}`);
      if (attempt >= retries) {
        console.error('Redis init failed after retries');
        throw err;
      }
      // exponential backoff
      const delay = baseDelay * attempt;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

export default redisClient;
