const express = require("express");
const router = express.Router();
const LeagueController = require("../controllers/leagueController");

router.post("/api/league/create", LeagueController.createLeague);
router.post("/api/league/join", LeagueController.joinLeague);
router.post("/api/league/commentary", LeagueController.addCommentary);
router.post("/api/league/player-won-set", LeagueController.playerWonSet);
router.post("/api/league/player-won-leg", LeagueController.playerWonLeg);

router.post(
  "/api/league/player-disconnect",
  LeagueController.handlePlayerDisconnect,
);
router.get("/api/league/get-matchup", LeagueController.getMatchup);
router.get("/api/league/get-league", LeagueController.getLeague);

router.get(
  "/api/league/commentary-stats",
  LeagueController.getCommentaryStatsForLeagueMatchup,
);

module.exports = router;
