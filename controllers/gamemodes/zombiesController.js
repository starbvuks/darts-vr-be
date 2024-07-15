const ZombiesService = require('../../services/gamemodes/zombiesService');
const authService = require('../../services/auth/authService');

const ZombiesController = {
  createMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { player1Id, player2Id, matchType } = req.body;
      try {
        const match = await ZombiesService.createMatch(player1Id, player2Id, matchType);
        res.json(match);
      } catch (error) {
        console.error(`Error creating match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  updateMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId, playerId, playerStats } = req.body;
      try {
        const match = await ZombiesService.updateMatch(matchId, playerId, playerStats);
        res.json(match);
      } catch (error) {
        console.error(`Error updating match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  getMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId } = req.params;
      try {
        const match = await ZombiesService.getMatch(matchId);
        res.json(match);
      } catch (error) {
        console.error(`Error fetching match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
};

module.exports = ZombiesController;
