const express = require('express');
const router = express.Router();
const playstationController = require('../../controllers/auth/playstationController');

// PSN authentication route
router.post('/psn', playstationController.psnAuth);

module.exports = router;
