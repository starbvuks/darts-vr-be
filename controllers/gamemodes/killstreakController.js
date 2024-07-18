const MatchmakingService = require("../../services/matchmakingService");
const KillstreakService = require("../../services/gamemodes/killstreakService");
const authService = require("../../services/auth/authService");
const gameWebSocketHandler = require("../../sockets/gameSockets");

// 6666d32dead7f3bab9218bf8
// 6673d54ca1af8512fb61c979

const KillstreakController = {
  joinOrCreateMatch: async (req, res) => {
    try {
      const { matchType, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        if (matchType === "solo") {
          const match = await MatchmakingService.createSoloMatchKillstreak(
            playerId
          );
          if (match instanceof Error) {
            res.status(400).json({ message: match.message });
          } else {
            res.status(200).json(match);
          }
        } else {
          const match = await MatchmakingService.joinKillstreakQueue(
            "killstreak",
            playerId
          );
          if (match instanceof Error) {
            res.status(400).json({ message: match.message });
          } else if (match) {
            res.status(200).json(match);
          } else {
            res.status(202).json({ message: "Waiting for other players" });
          }
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  createPrivateMatch: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const { playerId } = req.body;
        const newMatch = await KillstreakService.createMatch(playerId);
        if (newMatch instanceof Error) {
          res.status(500).json({ message: newMatch.message });
        } else {
          res.status(200).json(newMatch);
        }
      });
    } catch (error) {
      console.error("Error in createMatch controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  inviteFriend: async (req, res, wss) => {
    try {
      const { playerId, friendId, matchId } = req.body;
      authService.validateJwt(req, res, async () => {
        gameWebSocketHandler.sendKillstreakInvitation(
          friendId,
          playerId,
          matchId,
          wss
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
        const match = await KillstreakService.joinMatch(matchId, playerId);
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      console.error("Error in joinMatch controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateMatchStats: async (req, res) => {
    try {
      const { matchId, playerId, playerStats } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.updateMatchStats(
          matchId,
          playerId,
          playerStats
        );
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  endRound: async (req, res) => {
    try {
      const { matchId, roundWinner } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.endRound(matchId, roundWinner);
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  endMatch: async (req, res) => {
    try {
      const { matchId, winner } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.endMatch(matchId);
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getMatch: async (req, res) => {
    try {
      const { matchId } = req.params;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.getMatch(matchId);
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  closeMatch: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const { matchId, winner } = req.body;
        const closedKillstreak = await KillstreakService.closeMatch(
          matchId,
          winner
        );
        if (closedKillstreak instanceof Error) {
          res.status(400).json({ message: closedKillstreak.message });
        } else {
          res.status(200).json(closedKillstreak);
        }
      });
    } catch (error) {
      console.error("Error in close Killstreak controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = KillstreakController;
