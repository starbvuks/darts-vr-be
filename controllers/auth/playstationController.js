const psnService = require("../../services/auth/playstationService");
const Player = require("../../models/Player");
const authService = require("../../services/auth/authService");
const jwt = require("jsonwebtoken");

exports.validatePSNSession = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Validate the ID token
    const { online_id, age, device_type } = await psnService.validatePSNSession(idToken);

    // Check if the user exists
    let player = await Player.findOne({ "auth.platformId": online_id });

    if (!player) {
      // Create a new player document if it doesn't exist
      player = new Player({
        auth: [
          {
            platform: "PlayStation",
            platformId: online_id,
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
  } catch (error) {
    console.error("PSN auth error:", error);
    res.status(400).json({ error: error.message });
  }
};