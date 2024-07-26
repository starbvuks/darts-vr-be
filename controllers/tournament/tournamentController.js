const TournamentService = require("../../services/tournament/tournamentService"); // Adjust the path as necessary

const TournamentController = {
  createTournament: async (req, res) => {
    const tournamentDetails = req.body; 

    try {
      const tournament = await TournamentService.createTournament(tournamentDetails);
      return res.status(201).json({ success: true, tournament });
    } catch (error) {
      console.error("Error creating tournament:", error);
      return res.status(500).json({ success: false, message: "Failed to create tournament." });
    }
  },

  joinTournament: async (req, res, wss) => {
    const { tournamentId, playerId, requiredPlayers, sets, legs } = req.body;

    try {
      const result = await TournamentService.joinTournamentQueue(tournamentId, playerId, requiredPlayers, sets, legs, wss);
      
      if (result && result.success === false) {
        return res.status(400).json(result); 
      } else if (result) {
        return res.status(200).json({ success: true, message: "Joined tournament successfully", match: result });
      } else {
        return res.status(202).json({ success: false, message: "Waiting for more players to join the queue." });
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      return res.status(500).json({ success: false, message: "Failed to join tournament." });
    }
  },
};

module.exports = TournamentController;
