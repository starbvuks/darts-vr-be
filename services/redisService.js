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

  getPlayerFromQueue: async (queueName, index) => {
    return new Promise((resolve, reject) => {
      redis.lindex(queueName, index, (err, playerId) => {
        if (err) {
          console.error("Error getting player from queue:", err);
          return reject(err);
        }
        resolve(playerId);
      });
    });
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

  // Tournament
  getTourneyQueueOpenTime: async (queueName) => {
    const openTime = await redis.get(`${queueName}:open_time`);
    console.log(`Retrieved Open Time for ${queueName}: ${openTime}`); // Log the retrieved open time
    return openTime; // This will return the open time as a string
  },

  getTourneyQueueExpiry: async (queueName) => {
    const ttl = await redis.ttl(queueName);
    return ttl;
  },

  isTourneyQueueOpen: async (queueName) => {
    const openTime = await RedisService.getTourneyQueueOpenTime(queueName);
    return openTime && Date.now() >= parseInt(openTime);
  },

  addToQueueWithExpiry: async (queueName, expiryTimeInSeconds) => {
    // await redis.rpush(queueName); 
    await redis.expire(queueName, expiryTimeInSeconds); 
  },

  // Store the open time for the tournament queue
  setTourneyQueueOpenTime: async (queueName, openTime) => {
    await redis.set(`${queueName}:open_time`, openTime);
  },

  // Close the tournament queue by deleting it
  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await redis.del(queueName); // Delete the queue
    await redis.del(`${queueName}:open_time`); // Optionally delete the open time key
    console.log(`Tournament queue closed and deleted for tournament ID: ${tournamentId}`);
  },
};

module.exports = RedisService;
