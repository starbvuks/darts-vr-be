const express = require("express");
const router = express.Router();
const TournamentController = require("../../controllers/tournament/tournamentController");

router.post("/api/tournament/create", TournamentController.createTournament);
router.post("/api/tournament", TournamentController.joinTournament);

module.exports = router;