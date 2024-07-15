const express = require('express');
const router = express.Router();
const ZombiesController = require('../../controllers/gamemodes/zombiesController');
const ATWController = require('../../controllers/gamemodes/atwController');
const KillstreakController = require('../../controllers/gamemodes/killstreakController');

router.post('/api/killstreak/create-match', KillstreakController.createMatch);
router.post('/api/killstreak/update-match', KillstreakController.updateMatch);
router.post('/api/killstreak/add-round-winner', KillstreakController.addRoundWinner);
router.post('/api/killstreak/determine-match-winner', KillstreakController.determineMatchWinner);
router.get('/api/killstreak/get-match/:matchId', KillstreakController.getMatch);

router.post('/api/atw/create-match', ATWController.createMatch);
router.post('/api/atw/update-match', ATWController.updateMatch);
router.get('/api/atw/get-match/:matchId', ATWController.getMatch);

router.post('/api/zombies/create-match', ZombiesController.createMatch);
router.post('/api/zombies/update-match', ZombiesController.updateMatch);
router.get('/api/zombies/get-match/:matchId', ZombiesController.getMatch);

module.exports = router;
