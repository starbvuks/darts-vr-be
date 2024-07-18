const express = require('express');
const router = express.Router();
const ZombiesController = require('../../controllers/gamemodes/zombiesController');
const ATWController = require('../../controllers/gamemodes/atwController');
const KillstreakController = require('../../controllers/gamemodes/killstreakController');

// Zombies Routes
router.post('/api/zombies', ZombiesController.joinOrCreateMatch);
router.post('/api/zombies/create-private', ZombiesController.createPrivateMatch);
router.post('/api/zombies/join', ZombiesController.joinInvitedMatch);
router.patch('/api/zombies/update', ZombiesController.updateMatchStats);
router.get('/api/zombies/get-match/:matchId', ZombiesController.getMatch);
router.post('/api/zombies/close-match', ZombiesController.closeMatch);

// Killstreak Routes
router.post('/api/killstreak', KillstreakController.joinOrCreateMatch);
router.post('/api/killstreak/create-private', ZombiesController.createPrivateMatch);
router.post('/api/killstreak/join', KillstreakController.joinInvitedMatch);
router.patch("/api/killstreak/update", KillstreakController.updateMatchStats);
router.patch("/api/killstreak/end-round", KillstreakController.endRound);
router.post("/api/killstreak/end-match", KillstreakController.endMatch);
router.get('/api/zombies/get-match/:matchId', KillstreakController.getMatch);
router.post('/api/zombies/close-match', KillstreakController.closeMatch);

// ATW Routes
router.post('/api/atw/create-match', ATWController.createMatch);
router.post('/api/atw/update-match', ATWController.updateMatch);
router.get('/api/atw/get-match/:matchId', ATWController.getMatch); 

module.exports = router;
