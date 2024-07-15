const KillstreakService = require('../../services/gamemodes/killstreakService');
const authService = require('../../services/auth/authService');

const KillstreakController = {
  createMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { player1Id, player2Id, matchType } = req.body;
      try {
        const match = await KillstreakService.createMatch(player1Id, player2Id, matchType);
        res.json(match);
      } catch (error) {
        console.error(`Error creating Killstreak match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  updateMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId, playerId, playerStats } = req.body;
      try {
        const match = await KillstreakService.updateMatch(matchId, playerId, playerStats);
        res.json(match);
      } catch (error) {
        console.error(`Error updating Killstreak match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  addRoundWinner: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId, roundNumber, winner } = req.body;
      try {
        const match = await KillstreakService.addRoundWinner(matchId, roundNumber, winner);
        res.json(match);
      } catch (error) {
        console.error(`Error adding round winner: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  determineMatchWinner: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId } = req.params;
      try {
        const winner = await KillstreakService.determineMatchWinner(matchId);
        res.json({ winner });
      } catch (error) {
        console.error(`Error determining match winner: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
  getMatch: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { matchId } = req.params;
      try {
        const match = await KillstreakService.getMatch(matchId);
        res.json(match);
      } catch (error) {
        console.error(`Error fetching Killstreak match: ${error}`);
        res.status(400).json({ message: error.message });
      }
    });
  },
};

module.exports = KillstreakController;
