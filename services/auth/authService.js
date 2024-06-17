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

    const user = await User.findOne({ 'auth.refreshToken': refreshToken });
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateTokens(user._id).accessToken;
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: error.message });
  }
};
