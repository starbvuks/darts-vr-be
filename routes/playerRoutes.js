const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/api/users', playerController.getUserProfile);
router.get('/api/users/stats', playerController.getUserStats);
router.get('/api/users/friends', playerController.getUserFriends);
router.get('/api/users/requests', playerController.getUserRequests);
router.get('/api/users/cosmetics', playerController.getUserCosmetics);
router.get('/api/users/preferences', playerController.getUserPreferences);

module.exports = router;
