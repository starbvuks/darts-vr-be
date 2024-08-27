// controllers/leaderboardController.js
const LeaderboardService = require("../services/leaderboardService");

const LeaderboardController = {
  async getTopPlayersOverall(req, res) {
    try {
      const topPlayers = await LeaderboardService.getTopPlayersOverall();
      return res.status(200).json({ success: true, topPlayers });
    } catch (error) {
      console.error("Error getting top players overall:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getTopPlayersByGameMode(req, res) {
    const { gameMode } = req.params;

    try {
      const topPlayers =
        await LeaderboardService.getTopPlayersByGameMode(gameMode);
      return res.status(200).json({ success: true, topPlayers });
    } catch (error) {
      console.error(`Error getting top players for ${gameMode}:`, error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = LeaderboardController;
