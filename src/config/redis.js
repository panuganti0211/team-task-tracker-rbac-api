import redis from 'redis';
import config from './index.js';

const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
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
