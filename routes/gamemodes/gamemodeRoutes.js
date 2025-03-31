const express = require("express");
const router = express.Router();
const ZombiesController = require("../../controllers/gamemodes/zombiesController");
const ATWController = require("../../controllers/gamemodes/atwController");
const KillstreakController = require("../../controllers/gamemodes/killstreakController");
const FiveOhOneController = require("../../controllers/gamemodes/fiveOhOneController");

// Zombies Routes
router.post(
  "/api/zombies/create-private",
  ZombiesController.createPrivateMatch,
);
router.post("/api/zombies/join", ZombiesController.joinInvitedMatch);
router.patch("/api/zombies/update", ZombiesController.updateMatchStats);
router.get("/api/zombies/get-match/:matchId", ZombiesController.getMatch);
router.post("/api/zombies/close-match", ZombiesController.closeMatch);
router.post("/api/zombies/update-sp", (req, res) => {
  zombiesController.updateSingleplayerStats(req, res);
});

// Killstreak Routes
router.post(
  "/api/killstreak/create-private",
  KillstreakController.createPrivateMatch,
);
router.post("/api/killstreak/join", KillstreakController.joinInvitedMatch);
router.patch("/api/killstreak/update", KillstreakController.updateMatchStats);
router.post("/api/killstreak/end-match", KillstreakController.endMatch);
router.get("/api/killstreak/get-match/:matchId", KillstreakController.getMatch);
router.post("/api/killstreak/close-match", KillstreakController.closeMatch);
router.post("/api/killstreak/update-sp", (req, res) => {
  killstreakController.updateSingleplayerStats(req, res);
});

// 501 Routes
router.post("/api/501/create-private", FiveOhOneController.createPrivateMatch);
router.post("/api/501/join", FiveOhOneController.joinInvitedMatch);
router.post("/api/501/start-match", FiveOhOneController.startMatch);
router.patch("/api/501/update", FiveOhOneController.updateMatchStats);
router.patch("/api/501/update-sp", FiveOhOneController.updateSingleplayerStats);
router.post("/api/501/end-match", FiveOhOneController.endMatch);
router.get("/api/501/get-match/:matchId", FiveOhOneController.getMatch);
router.post("/api/501/close-match", FiveOhOneController.closeMatch);
router.post("/api/501/last-turn", FiveOhOneController.updateLastTurn);
router.get("/api/501/last-turn", FiveOhOneController.getLastTurn);
router.get("/api/501/commentary-stats", FiveOhOneController.getCommentaryStats);

router.post("/api/exit-queue", FiveOhOneController.removePlayerFromQueue);

// ATW Routes
router.post("/api/atw/create-match", ATWController.createMatch);
router.post("/api/atw/update-match", ATWController.updateMatch);
router.get("/api/atw/get-match/:matchId", ATWController.getMatch);

module.exports = router;
