const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/auth/playstationController');

router.get('/authenticate', authenticate);

module.exports = router;
