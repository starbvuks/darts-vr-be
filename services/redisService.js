const Redis = require("ioredis");
const redis = new Redis("redis://localhost:6379");

const RedisService = {
  addToQueue: async (queueName, playerId) => {
    await redis.lpush(queueName, playerId);
  },

  getPlayersFromQueue: async (queueName, count) => {
    return await redis.lrange(queueName, 0, count - 1);
  },

  removePlayersFromQueue: async (queueName, count) => {
    await redis.ltrim(queueName, count, -1);
  },

  getQueueLength: async (queueName) => {
    return await redis.llen(queueName);
  },

  publishMatchCreated: async (channel, message) => {
    await redis.publish(channel, message);
  },

  subscribeToChannel: async (channel, callback) => {
    const subscriber = new Redis();
    await subscriber.subscribe(channel);
    subscriber.on("message", callback);
  },
};

module.exports = RedisService;
