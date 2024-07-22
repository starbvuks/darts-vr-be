const express = require('express');
const router = express.Router();
const LeagueController = require('../controllers/leagueController');

router.post('/api/league/create', LeagueController.createLeague);
router.post('/api/league/invite', LeagueController.invitePlayer);
router.post('/api/league/join', LeagueController.joinLeague);
router.post('/api/league/start', LeagueController.startLeague);
// router.post('/api/league/update-stats', LeagueController.dartThrow);
router.post('/api/league/commentary', LeagueController.addCommentary);
router.post('/api/league/end-match', LeagueController.endMatch);
router.post('/api/league/end-round', LeagueController.advanceRound);
router.post('/api/league/end-league', LeagueController.endLeague);
router.post('/api/league/player-disconnect', LeagueController.handlePlayerDisconnect);

module.exports = router;