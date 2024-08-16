const express = require("express");
const router = express.Router();
const TournamentController = require("../../controllers/tournament/tournamentController");

router.get("/api/tournament", TournamentController.getTournamentById);
router.get(
  "/api/tournament/active",
  TournamentController.listActiveTournaments,
);

module.exports = router;
