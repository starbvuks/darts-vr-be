// src/services/auth/commonAuthService.js
const User = require('../../models/Player');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET_KEY; 

exports.generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '2h' });
  const refreshToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '14d' });
  return { accessToken, refreshToken };
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, jwtSecret, async (err, payload) => {
      if (err) {
        console.error('Refresh token verification error:', err);
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const { userId } = payload;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const newAccessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '2h' });
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.validateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401); // Unauthorized
  } 

  const token = authHeader.split(" ")[1];
  // console.log("Token:", token); 
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) {
      console.error("JWT Verification Error:", err); 
      return res.sendStatus(403); 
    }
    console.log("Payload:", payload);
    req.userId = payload.userId; 
    next();
  });
};

