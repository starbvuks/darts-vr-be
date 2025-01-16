const psnService = require("../../services/auth/playstationService");
const Player = require("../../models/Player");
const authService = require("../../services/auth/authService");
const jwt = require("jsonwebtoken");

exports.validatePSNSession = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Validate the ID token
    const { decodedPayload } = await psnService.validatePSNSession(idToken);
    console.log(decodedPayload);

    // Check if the user exists
    let player = await Player.findOne({
      "auth.platformId": decodedPayload.online_id,
    });

    if (!player) {
      // Create a new player document if it doesn't exist
      player = new Player({
        username: decodedPayload.online_id,
        auth: [
          {
            platform: "PlayStation",
            platformId: decodedPayload.online_id,
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
      player.username = decodedPayload.online_id;
      await player.save();
    }

    const { accessToken, refreshToken } = await authService.generateTokens(
      player._id,
    );

    res.json({ accessToken, refreshToken });
    console.log(`Login success, token: ${accessToken}`);
  } catch (error) {
    console.error("PSN auth error:", error);
    res.status(400).json({ error: error.message });
  }
};
