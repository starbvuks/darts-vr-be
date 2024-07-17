const oculusService = require("../../services/auth/oculusService");
const authService = require("../../services/auth/authService");
const Player = require("../../models/Player");
const Cosmetics = require("../../models/Cosmetics");

const validateOculusSession = async (req, res) => {
  try {
    const { nonce, oculusId } = req.body;

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
          const defaultCosmetics = await Cosmetics.find({
            type: { $in: ["hat", "hands", "dartSkin", "glasses", "gender"] },
            unityId: "0",
          });

          // Create a new player document if it doesn't exist
          player = new Player({
            auth: [
              {
                platform: "Oculus",
                platformId: oculusId,
                _id: false,
              },
            ],
            profile: {
              cosmetics: {
                hat: {
                  hatId: defaultCosmetics.find((c) => c.type === "hat")._id,
                },
                hands: {
                  handsId: defaultCosmetics.find((c) => c.type === "hands")._id,
                },
                dartSkin: {
                  dartSkinId: defaultCosmetics.find(
                    (c) => c.type === "dartSkin"
                  )._id,
                },
                glasses: {
                  glassesId: defaultCosmetics.find((c) => c.type === "glasses")
                    ._id,
                },
                gender: {
                  genderId: defaultCosmetics.find((c) => c.type === "gender")
                    ._id,
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
