const express = require('express');
const router = express.Router(); // Assuming you're using Express Router for modular routing

// Middleware to detect the platform of the incoming request
router.use((req, res, next) => {
  let platform;

  // Detect Steam
  if (req.headers['steam-user-id'] || req.headers['x-steam-auth-session-ticket']) {
    platform = 'Steam';
  }
  // Detect Oculus
  else if (req.headers['oculus-user-id'] || req.headers['x-oculus-nonce']) {
    platform = 'Oculus';
  }
  // Detect PlayStation
  else if (req.headers.authorization && /^Bearer PSN/.test(req.headers.authorization)) {
    platform = 'PlayStation';
  }

  if (!platform) {
    // If no platform is detected, respond with an error
    return res.status(400).json({ error: 'Unsupported platform' });
  }

  // Attach the detected platform to the request object
  req.platform = platform;
  next();
});

module.exports = router;
