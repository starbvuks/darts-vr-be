const Player = require("../../models/Player");
const playstationService = require("../../services/auth/playstationService");
const authService = require("../../services/auth/authService");

exports.psnAuth = async (req, res, next) => {
  try {
    const { npsso } = req.body;

    // Use the PSN API service to get the access token and profile
    const { accessToken, refreshToken, expiresIn, profile } =
      await playstationService.authenticate(npsso);
    const psnId = profile.accountId; // This remains unchanged

    // Check if user exists in DB using only psnId
    let player = await Player.findOne({ "auth.platformId": psnId });

    if (!player) {
      // Since we're not using email anymore, we don't need to check or create based on it
      player = new Player({
        username: profile.onlineId, // Assuming profile.onlineId contains the username
        auth: [
          {
            platform: "PlayStation",
            platformId: psnId,
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
          },
        ],
      });
      await player.save();
    }

    // Use the common auth service to generate tokens
    const tokens = authService.generateTokens(player._id);

    // Update the player's document with the new refresh token
    player.auth = player.auth.map((authEntry) =>
      authEntry.platform === "PlayStation"
       ? {
           ...authEntry,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: "2h",
          }
        : authEntry
    );

    await player.save();

    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "PSN authentication failed" });
  }
};
