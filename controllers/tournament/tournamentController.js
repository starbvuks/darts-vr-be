const TournamentService = require("../../services/tournament/tournamentService");
const authService = require("../../services/auth/authService");

const TournamentController = {
  createTournament: async (req, res, wss) => {
    authService.validateJwt(req, res, async () => {
      const tournamentDetails = req.body;

      try {
        const tournament = await TournamentService.createTournament(
          tournamentDetails,
          wss,
        );
        return res.status(201).json(tournament);
      } catch (error) {
        console.error("Error creating tournament:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to create tournament." });
      }
    });
  },

  joinTournament: async (req, res, wss) => {
    authService.validateJwt(req, res, async () => {
      const { tournamentId, playerId } = req.body;

      try {
        const result = await TournamentService.joinTournamentQueue(
          tournamentId,
          playerId,
          wss,
        );

        if (result && !result.success) {
          return res.status(400).json(result);
        }

        return res.status(200).json({
          success: true,
          message: "Joined tournament successfully",
          match: result,
        });
      } catch (error) {
        console.error("Error joining tournament:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to join tournament." });
      }
    });
  },

  getTournamentById: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { tournamentId } = req.query; // Using query params

      try {
        const tournament =
          await TournamentService.getTournamentById(tournamentId);

        if (!tournament) {
          return res
            .status(404)
            .json({ success: false, message: "Tournament not found." });
        }

        return res.status(200).json({ success: true, tournament });
      } catch (error) {
        console.error("Error fetching tournament by ID:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to fetch tournament." });
      }
    });
  },

  listActiveTournaments: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      try {
        const tournaments = await TournamentService.listActiveTournaments();

        if (!tournaments || tournaments.length === 0) {
          return res
            .status(200)
            .json({ success: true, message: "No active tournaments found." });
        }

        return res.status(200).json({ success: true, tournaments });
      } catch (error) {
        console.error("Error listing active tournaments:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to list active tournaments.",
        });
      }
    });
  },

  deleteTournament: async (req, res) => {
    authService.validateJwt(req, res, async () => {
      const { tournamentId } = req.body;

      try {
        const result = await TournamentService.deleteTournament(tournamentId);

        if (!result.success) {
          return res
            .status(404)
            .json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
      } catch (error) {
        console.error("Error deleting tournament:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete tournament." });
      }
    });
  },
};

module.exports = TournamentController;
