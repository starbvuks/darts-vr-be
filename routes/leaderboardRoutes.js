// routes/leaderboardRoutes.js
const express = require("express");
const LeaderboardController = require("../controllers/leaderboardController");

const router = express.Router();

// Route to get top players overall
router.get("/leaderboard/overall", LeaderboardController.getTopPlayersOverall);

// Route to get top players by specific game mode
router.get(
  "/leaderboard/:gameMode",
  LeaderboardController.getTopPlayersByGameMode,
);

module.exports = router;
