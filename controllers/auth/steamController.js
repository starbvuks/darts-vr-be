const Player = require("../../models/Player");
const steamService = require("../../services/auth/steamService");
const authService = require("../../services/auth/authService");

exports.steamAuth = async (req, res) => {
  try {
    const { authTicket, username } = req.body;

    if (!authTicket) {
      return res.status(400).json({ error: "Auth ticket is required" });
    }

    const steamId = await steamService.authenticateUserTicket(authTicket);

    let player = await Player.findOne({ "auth.platformId": steamId });
    if (!player) {
      // Fetch the player's username from the Steam API
      // const playerSummary = await steamService.getPlayerSummaries(steamId);
      // const username = playerSummary.personaname;

      player = new Player({
        username: username ? username : "steam player",
        auth: [
          {
            platform: "Steam",
            platformId: steamId,
            _id: false,
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

    await player.save();
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Steam auth error:", error);
    res.status(400).json({ error: error.message });
  }
};
