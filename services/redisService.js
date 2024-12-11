const Redis = require("ioredis");
const redis = new Redis("redis://localhost:6379");

const RedisService = {
  addToQueue: async (queueName, playerId) => {
    const dummyValue = "dummy";
    console.log(`${playerId} joined queue: ${queueName}`);

    const queueLength = await redis.llen(queueName);
    if (queueLength > 0) {
      const queueItems = await redis.lrange(queueName, 0, -1);
      if (queueItems.includes(dummyValue)) {
        await redis.lrem(queueName, 0, dummyValue);
      }
    }

    await redis.rpush(queueName, playerId);
  },

  getPlayersFromQueue: async (queueName, numPlayers) => {
    // Defensive programming to ensure numPlayers is valid
    // console.log(`from redis: ${queueName}, ${numPlayers}`);
    if (
      typeof numPlayers !== "number" ||
      isNaN(numPlayers) ||
      numPlayers <= 0
    ) {
      throw new Error("numPlayers must be a valid positive integer.");
    }

    // Ensure numPlayers is properly converted to a valid integer
    const numPlayersInt = parseInt(numPlayers, 10);

    // Redis lrange command to get players from the queue
    const players = await redis.lrange(queueName, 0, numPlayersInt - 1);
    console.log(`Current contents of ${queueName} queue:`, players);
    return players;
  },

  isPlayerInQueue: async (queueName, playerId) => {
    const queueItems = await redis.lrange(queueName, 0, -1);
    return queueItems.includes(playerId);
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
  createQueue: async (queueName) => {
    await redis.lpush(queueName, "dummy");
    await redis.ltrim(queueName, 0, 0);
    console.log(`Queue ${queueName} created.`);
  },

  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await redis.del(queueName);
    await redis.del(`${queueName}:open_time`);
    console.log(
      `Tournament queue closed and deleted for tournament ID: ${tournamentId}`,
    );
  },

  queueExists: async (queueName) => {
    const exists = await redis.exists(queueName);
    console.log(`Checking if queue ${queueName} exists: ${exists}`);
    return exists === 1;
  },

  setTourneyQueueOpenTime: async (queueName, openTime) => {
    await redis.set(`${queueName}:open_time`, openTime.toString());
    console.log(`Set open time for ${queueName}: ${openTime}`);
  },

  addToQueueWithExpiry: async (queueName, expiryTimeInSeconds) => {
    await redis.expire(queueName, expiryTimeInSeconds);
    console.log(`Set expiry for ${queueName}: ${expiryTimeInSeconds} seconds`);
  },

  getTourneyQueueOpenTime: async (queueName) => {
    const openTime = await redis.get(`${queueName}:open_time`);
    console.log(`Retrieved Open Time for ${queueName}: ${openTime}`);
    return openTime;
  },

  getTourneyQueueExpiry: async (queueName) => {
    try {
      const ttl = await redis.ttl(queueName);

      if (ttl === -1) {
        return {
          success: true,
          message: "Queue exists but has no expiration.",
          expiry: null,
        };
      } else if (ttl === -2) {
        return {
          success: false,
          message: "Queue does not exist.",
          expiry: null,
        };
      } else {
        return { success: true, message: "Queue found.", expiry: ttl };
      }
    } catch (error) {
      console.error("Error getting tourney queue expiry:", error);
      return { success: false, message: "Failed to get queue expiry.", error };
    }
  },
};

module.exports = RedisService;
