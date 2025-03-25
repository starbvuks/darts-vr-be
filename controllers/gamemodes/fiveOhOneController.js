const MatchmakingService = require("../../services/matchmakingService");
const FiveOhOneService = require("../../services/gamemodes/fiveOhOneService");
const authService = require("../../services/auth/authService");
const gameWebSocketHandler = require("../../sockets/gameSockets");

const FiveOneOneController = {
  joinOrCreateMatch: async (req, res, wss) => {
    try {
      const { playerId, numPlayers } = req.body;
      authService.validateJwt(req, res, async () => {
        // Check if the request is for a solo match
        if (numPlayers === 1) {
          const soloMatch =
            await MatchmakingService.createSoloMatchFiveOhOne(playerId);
          if (soloMatch instanceof Error) {
            return res.status(400).json({ message: soloMatch.message });
          }
          return res.status(200).json(soloMatch);
        } else {
          // Handle multiplayer match joining
          const match = await MatchmakingService.joinFiveOhOneQueue(
            "501",
            playerId,
            numPlayers,
            wss,
          );
          if (match instanceof Error) {
            return res.status(400).json({ message: match.message });
          } else if (match) {
            return res.status(200).json(match);
          } else {
            return res.status(202).json({
              message: "Waiting for other players to join the queue.",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error in joinOrCreateMatch controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  createRematch: async (req, res, wss) => {
    try {
      const { creatorId, playerIds, numPlayers } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.createRematch(creatorId, playerIds, numPlayers, wss);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json(result.match);
      });
    } catch (error) {
      console.error("Error in createRematch controller:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  createPrivateMatch:  async (req, res) => {
    try {
      const { playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.createPrivateMatch(playerId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.match);
      });
    } catch (error) {
      console.error("Error in creative private match", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  inviteFriend: async (req, res, wss) => {
    try {
      const { playerId, friendId, matchId } = req.body;
      authService.validateJwt(req, res, async () => {
        gameWebSocketHandler.send501Invitation(
          friendId,
          playerId,
          matchId,
          wss,
        );
        res.status(200).json({ message: "Invitation sent" });
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  joinInvitedMatch: async (req, res) => {
    try {
      const { matchId, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.joinPrivateMatch(
          matchId,
          playerId,
        );
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.match);
      });
    } catch (error) {
      console.error("Error in joining private match", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  startMatch: async (req, res) => {
    try {
      const { matchId } = req.body; // Expecting matchId in the request body
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.startMatch(matchId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.match);
      });
    } catch (error) {
      console.error("Error in startMatch controller:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  updateMatchStats: async (req, res) => {
    const { matchId, playerId, playerStats } = req.body;
    const result = await FiveOhOneService.updateMatchStats(
      matchId,
      playerId,
      playerStats,
    );
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json(result.match);
  },

  updateSingleplayerStats: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const { playerId, playerStats } = req.body;

        const result = await FiveOhOneService.updateSingleplayerStats(
          playerId,
          playerStats,
        );

        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }

        return res.status(200).json({
          message: "Singleplayer stats updated successfully",
          player: result.player,
        });
      });
    } catch (error) {
      console.error("Error in updateSingleplayerStats controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  endMatch: async (req, res) => {
    const { matchId, winnerId } = req.body;
    const result = await FiveOhOneService.endMatch(matchId, winnerId);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json(result.match);
  },

  getMatch: async (req, res) => {
    try {
      const { matchId } = req.params; // Expecting matchId in the request parameters
      const result = await FiveOhOneService.getMatch(matchId);
      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }
      return res.status(200).json(result.match);
    } catch (error) {
      console.error("Error in getMatch controller:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  closeMatch: async (req, res) => {
    try {
      const { matchId } = req.body; // Expecting matchId in the request body
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.closeMatch(matchId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.match);
      });
    } catch (error) {
      console.error("Error in closeMatch controller:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  updateLastTurn: async (req, res) => {
    const { matchId, playerId, dart1, dart2, dart3 } = req.body;

    try {
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.updateLastTurn(
          matchId,
          playerId,
          dart1,
          dart2,
          dart3,
        );
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json({
          message: "Last turn updated successfully",
          lastTurn: result.lastTurn,
        });
      });
    } catch (error) {
      console.error("Error updating last turn:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  getLastTurn: async (req, res) => {
    const { matchId, playerId } = req.query;

    try {
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.getLastTurn(matchId, playerId);
        if (!result.success) {
          return res.status(404).json({ message: result.message });
        }
        return res.status(200).json({ lastTurn: result.lastTurn });
      });
    } catch (error) {
      console.error("Error fetching last turn:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  removePlayerFromQueue: async (req, res) => {
    try {
      const { gameType, numPlayers, playerId } = req.body; // Expecting gameType and playerId in the request body
      authService.validateJwt(req, res, async () => {
        const result = await MatchmakingService.removePlayerFromQueue(
          gameType,
          numPlayers,
          playerId,
        );
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json({ message: result.message });
      });
    } catch (error) {
      console.error("Error removing player from queue:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  getCommentaryStats: async (req, res) => {
    try {
      // First, validate JWT
      authService.validateJwt(req, res, async () => {
        const { matchId } = req.query;

        // Call the service to fetch commentary stats
        const result = await FiveOhOneService.getCommentaryStats(matchId);

        // Handle errors or success
        if (!result.success) {
          return res
            .status(404)
            .json({ success: false, message: result.message });
        }

        // Return the players array as requested
        return res.status(200).json({ players: result.players });
      });
    } catch (error) {
      console.error("Error fetching commentary stats:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },

  getMatchHistory: async (req, res) => {
    try {
      const { playerId } = req.params;
      authService.validateJwt(req, res, async () => {
        const result = await FiveOhOneService.getMatchHistory(playerId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result);
      });
    } catch (error) {
      console.error("Error fetching match history:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
};

module.exports = FiveOneOneController;
