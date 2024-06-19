// oculusRoute.js
const express = require('express');
const router = express.Router();
const oculusController = require('../../controllers/auth/oculusController');

router.post('/oculus', oculusController.validateOculusSession);

module.exports = router;
