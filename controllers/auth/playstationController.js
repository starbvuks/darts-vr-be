const Player = require("../../models/Player");
const playstationService = require("../../services/auth/playstationService");
const authService = require("../../services/auth/authService");

exports.psnAuth = async (req, res, next) => {
  try {
    const { npsso } = req.body;

    const { accessToken, refreshToken, expiresIn, profile } =
      await playstationService.authenticate(npsso);
    const psnId = profile.accountId;

    let player = await Player.findOne({ "auth.platformId": psnId });

    if (!player) {
      player = new Player({
        username: profile.onlineId,
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

    const tokens = authService.generateTokens(player._id);

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
