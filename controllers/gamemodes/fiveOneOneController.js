const MatchmakingService = require("../../services/matchmakingService");
const fiveOneOneService = require("../../services/gamemodes/fiveOneOneService");
const authService = require("../../services/auth/authService");
const gameWebSocketHandler = require("../../sockets/gameSockets");

export const fiveOneOneController = {
  joinOrCreateMatch: async (req, res, wss) => {
    try {
      const { playerId, numPlayers } = req.body; // Expecting playerId and numPlayers in the request body
      authService.validateJwt(req, res, async () => {
        // Check if the request is for a solo match
        if (numPlayers === 1) {
          const soloMatch = await MatchmakingService.createSoloMatchFiveOhOne(
            playerId
          );
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
            wss
          );
          if (match instanceof Error) {
            return res.status(400).json({ message: match.message });
          } else if (match) {
            return res.status(200).json(match);
          } else {
            return res
              .status(202)
              .json({
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
};
