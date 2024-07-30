const ATWService = require('../../services/gamemodes/atwService');
const authService = require('../../services/auth/authService');

const ATWController = {
  createMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { playerId } = req.body;
      try {
        const match = await ATWService.createMatch(playerId);
        res.json(match);
      } catch (error) {
        console.error(`Error creating ATW match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },

  updateMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId, stats } = req.body;
      try {
        const match = await ATWService.updateMatch(matchId, stats);
        res.json(match);
      } catch (error) {
        console.error(`Error updating ATW match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  
  getMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId } = req.params;
      try {
        const match = await ATWService.getMatch(matchId);
        res.json(match);
      } catch (error) {
        console.error(`Error fetching ATW match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
};

module.exports = ATWController;
