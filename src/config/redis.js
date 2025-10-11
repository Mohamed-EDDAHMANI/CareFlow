import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));

await redisClient.connect();

export default redisClient;
