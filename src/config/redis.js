import redis from 'redis';
import config from './index.js';

const redisClient = redis.createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    reconnectStrategy: (retries) =>
      Math.min(retries * 50, 500),
  },
  database: config.redis.db,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

await redisClient.connect();

export default redisClient;