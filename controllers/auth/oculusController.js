// oculusController.js
const oculusService = require('../../services/auth/oculusService');
const authService = require('../../services/auth/authService');
const Player = require('../../models/Player');

const validateOculusSession = async (req, res) => {
  try {
    const { nonce, oculusId } = req.body;
    const isValid = await oculusService.validateOculusNonce(nonce, oculusId);

    if (isValid) {
      let player = await Player.findOne({ 'auth.platformId': oculusId });

      if (!player) {
        player = await Player.findOne({ email: req.body.email });
        if (player) {
          player.auth.push({
            platform: 'Oculus',
            platformId: oculusId,
          });
        } else {
          player = new Player({
            email: req.body.email,
            username: req.body.username,
            auth: [
              {
                platform: 'Oculus',
                platformId: oculusId,
              },
            ],
          });
        }
        await player.save();
      }

      const { accessToken, refreshToken } = await authService.generateOculusTokens(oculusId);
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).json({ message: 'Invalid Oculus nonce' });
    }
  } catch (error) {
    console.error('Error validating Oculus session:', error);
    res.status(500).json({ message: 'Error validating Oculus session' });
  }
};

module.exports = {
  validateOculusSession,
};
