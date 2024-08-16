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

    await player.save();
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Steam auth error:", error);
    res.status(400).json({ error: error.message });
  }
};
