const oculusService = require("../../services/auth/oculusService");
const authService = require("../../services/auth/authService");
const Player = require("../../models/Player");

exports.validateOculusSession = async (req, res) => {
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
                head: {
                  cosmeticId: "5fca99d1-a5fb-44c3-87e4-dfa3cd7b0817",
                },
                hands: {
                  cosmeticId: "f571dcf2-5a29-41c0-982e-ea286cf0f201",
                },
                dartSkin: {
                  cosmeticId: "3621738c-2bf3-45bf-8270-6463769c25e7",
                },
                accesory: {
                  cosmeticId: "e916fe6f-a0ab-42ca-96bb-d7e13af9ce6a",
                },
                face: {
                  cosmeticId: "e35ffbc7-e3a6-413f-aac9-14f180963cef",
                },
              },
            },
            achievements: {
              Marksman: false,
              Perfectionist: false,
              OnaHigh: false,
              Hattrick: false,
              Unstoppable: false,
              Sniper: false,
              GlobeTrotter: false,
              Headshooter: false,
              MustBeDrunk: false,
              BringingOuttheMonster: false,
              SleepingDeads: false,
              TopOfTheWorld: false,
              QuiteAComeBack: false,
              NoMercy: false,
              GrandSalute: false,
              FirstBlood: false,
              Rampage: false,
              TheLegend: false,
              GrandSlam: false,
              MVP: false,
              Dynamite: false,
              TeamPlayer: false,
            },
          });
          await player.save();
        } else {
          player.username = username;
          await player.save();
        }

        const { accessToken, refreshToken } = await authService.generateTokens(
          player._id,
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
