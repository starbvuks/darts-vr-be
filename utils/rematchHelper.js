const Player = require("../models/Player");
const gameSockets = require("../sockets/gameSockets");
const { v4: uuidv4 } = require("uuid");

const rematchHelper = {
  validatePlayers: async (playerIds, numPlayers) => {
    if (playerIds.length !== numPlayers) {
      return {
        success: false,
        message: "Number of player IDs does not match numPlayers.",
      };
    }

    const players = await Player.find({ _id: { $in: playerIds } });
    if (players.length !== numPlayers) {
      return { success: false, message: "Some players not found." };
    }

    const playerData = playerIds
      .map((id, index) => {
        const player = players.find((p) => p._id.equals(id));
        return {
          id: player ? player._id.toString() : null,
          username: player ? player.username : `player${index + 1}`,
        };
      })
      .filter((p) => p.id !== null);

    return { success: true, playerData };
  },

  notifyPlayers: (matchType, matchId, players, numPlayers, wss) => {
    const message = JSON.stringify({
      matchType,
      matchId,
      players: players.map((p) => p.id),
      numPlayers,
    });

    gameSockets.handleMatchCreatedNotification(message, wss);
  }
};

module.exports = rematchHelper; 