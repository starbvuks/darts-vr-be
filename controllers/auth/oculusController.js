const oculusService = require("../../services/auth/oculusService");
const authService = require("../../services/auth/authService");
const Player = require("../../models/Player");

const validateOculusSession = async (req, res) => {
  try {
    const { nonce, oculusId, username } = req.body;

    // Check if the received parameters are 'nonce' and 'oculusId'
    if (!nonce || !oculusId) {
      return res.status(400).json({
        message: 'Invalid parameters. Expected "nonce" and "oculusId".',
      });
    }

    try {
      const isValid = await oculusService.validateOculusNonce(nonce, oculusId);

      if (isValid) {
        let player = await Player.findOne({ "auth.platformId": oculusId });

        if (!player) {
          // Create a new player document if it doesn't exist
          player = new Player({
            username: username ? username : "oculus player",
            auth: [
              {
                platform: "Oculus",
                platformId: oculusId,
              },
            ],
            profile: {
              cosmetics: {
                hat: {
                  hatId: "667cfdf66b5fa5683c6eae99",
                },
                hands: {
                  handsId: "667cfdf66b5fa5683c6eae9a",
                },
                dartSkin: {
                  dartSkinId: "667cfdf66b5fa5683c6eae9b",
                },
                glasses: {
                  glassesId: "667cfdf66b5fa5683c6eae9c",
                },
                gender: {
                  genderId: "667cfdf66b5fa5683c6eae9d",
                },
              },
            },
          });
          await player.save();
        }

        const { accessToken, refreshToken } = await authService.generateTokens(
          player._id
        );

        res.json({ accessToken, refreshToken });
      } else {
        res.status(401).json({ message: "Invalid Oculus nonce" });
      }
    } catch (error) {
      console.error("Error validating Oculus session:", error);
      res.status(500).json({
        message: "Error validating Oculus session",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error processing Oculus session validation:", error);
    res.status(500).json({
      message: "Error processing Oculus session validation",
      error: error.message,
    });
  }
};

module.exports = {
  validateOculusSession,
};
