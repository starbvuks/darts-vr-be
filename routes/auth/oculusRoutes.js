const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/auth/oculusController');

router.get('/authenticate', authenticate);

module.exports = router;
