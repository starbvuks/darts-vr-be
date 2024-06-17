const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/steamController');
const authService = require('../../services/auth/authService');

router.post('/steam', authController.steamAuth);
router.post('/refresh', authService.refreshToken);

module.exports = router;