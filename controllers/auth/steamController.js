const Player = require("../../models/Player");
const steamService = require("../../services/auth/steamService");
const authService = require("../../services/auth/authService");
const Cosmetics = require("../../models/Cosmetics");

exports.steamAuth = async (req, res) => {
  try {
    const { authTicket } = req.body;

    if (!authTicket) {
      return res.status(400).json({ error: "Auth ticket is required" });
    }

    const steamId = await steamService.authenticateUserTicket(authTicket);

    let player = await Player.findOne({ "auth.platformId": steamId });
    if (!player) {
      const defaultCosmetics = await Cosmetics.find({
        type: { $in: ["hat", "hands", "dartSkin", "glasses", "gender"] },
        unityId: "0",
      });

      // Fetch the player's username from the Steam API
      const playerSummary = await steamService.getPlayerSummaries(steamId);
      const username = playerSummary.personaname;

      player = new Player({
        username,
        auth: [
          {
            platform: "Steam",
            platformId: steamId,
            _id: false
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
              dartSkinId: defaultCosmetics.find((c) => c.type === "dartSkin")
                ._id,
            },
            glasses: {
              glassesId: defaultCosmetics.find((c) => c.type === "glasses")._id,
            },
            gender: {
              genderId: defaultCosmetics.find((c) => c.type === "gender")._id,
            },
          },
        },
      });
      await player.save();
    }

    const { accessToken, refreshToken } = await authService.generateTokens(
      player._id
    );

    await player.save();
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Steam auth error:", error);
    res.status(400).json({ error: error.message });
  }
};