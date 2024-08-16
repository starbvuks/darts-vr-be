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
            achievements: {
              Marksman: { type: Boolean, default: false }, // Bullseye 10 times
              Perfectionist: { type: Boolean, default: false }, // Complete a game of 501 with 9 darts
              OnaHigh: { type: Boolean, default: false }, // Achieve a total of 180 points in a single game
              Hattrick: { type: Boolean, default: false }, // Hit three bullseye in a row
              Unstoppable: { type: Boolean, default: false }, // 1-10 in Around the world without failing
              Sniper: { type: Boolean, default: false }, // Killstreak hitting til 10x
              GlobeTrotter: { type: Boolean, default: false }, // Chose 5 different country flags
              Headshooter: { type: Boolean, default: false }, // 100 zombie headshots
              MustBeDrunk: { type: Boolean, default: false }, // Missed all three dart hits for the first time.
              BringingOuttheMonster: { type: Boolean, default: false }, // Hits 5 audience in party mode
              SleepingDeads: { type: Boolean, default: false }, // Headshots to all types of Zombies in one game
              TopOfTheWorld: { type: Boolean, default: false }, // League victory
              QuiteAComeBack: { type: Boolean, default: false }, // Win a game after being more than 200 points behind
              NoMercy: { type: Boolean, default: false }, // Win 5 matches of 501 in multiplayer without losing any
              GrandSalute: { type: Boolean, default: false }, // Finishing ATW in one single turn
              FirstBlood: { type: Boolean, default: false }, // Win your first game of Kill Streak
              Rampage: { type: Boolean, default: false }, // Achieve a killstreak of 15
              TheLegend: { type: Boolean, default: false }, // Finish 25 waves of zombies in solo
              GrandSlam: { type: Boolean, default: false }, // Win one multiplayer game of each mode
              MVP: { type: Boolean, default: false }, // Win 100 leagues
              Dynamite: { type: Boolean, default: false }, // Kill 50 zombies with explosive dart in one game
              TeamPlayer: { type: Boolean, default: false }, // Survive 15 waves of zombies in multiplayer
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
