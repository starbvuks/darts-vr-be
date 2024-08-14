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
