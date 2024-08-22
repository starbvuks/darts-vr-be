const express = require("express");
const router = express.Router();
const TournamentController = require("../../controllers/tournament/tournamentController");

router.get("/api/tournament", TournamentController.getTournamentById);
router.get(
  "/api/tournament/active",
  TournamentController.listActiveTournaments,
);
router.post("/api/tournament/delete", TournamentController.deleteTournament);

module.exports = router;
