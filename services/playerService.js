const mongoose = require("mongoose");
const Player = require("../models/Player");
const Cosmetics = require("../models/Cosmetics");
const FiveOhOne = require("../models/Game/FiveOhOne");

class PlayerService {
  async getUserProfile(userId) {
    return await Player.findById(userId).exec();
  }

  async getUsersProfiles(userIds) {
    return await Player.find({ _id: { $in: userIds } }).exec();
  }

  async getUserStats(userId) {
    // Fetch the player's stats
    const playerStats = await Player.findById(userId).select("stats").exec();
  
    // Fetch the last 5 matches for the player from the FiveOhOne model
    const recentMatches = await FiveOhOne.find({
      $or: [
        { player1Id: userId },
        { player2Id: userId },
        { player3Id: userId },
        { player4Id: userId },
      ],
      status: "closed", // Only include completed matches
    })
      .sort({ createdAt: -1 }) // Sort by the most recent
      .limit(5) // Limit to the last 5 matches
      .exec();
  
    // Map the matches to determine win/loss/null for each
    const matchHistory = recentMatches.map((match) => {
      if (match.winner && match.winner.equals(userId)) {
        return true; // Player won
      } else if (match.winner) {
        return false; // Player lost
      }
      return null; // No clear win/loss
    });
  
    // Ensure exactly 5 entries in matchHistory (fill with null if fewer matches exist)
    while (matchHistory.length < 5) {
      matchHistory.push(null);
    }
  
    // Add matchHistory to the response
    return {
      stats: playerStats ? playerStats.stats : null,
      matchHistory,
    };
  }
  

  async getUserFriends(userId) {
    try {
      const user = await Player.findById(userId)
        .select("profile.friends")
        .exec();

      if (!user || !user.profile.friends || user.profile.friends.length === 0) {
        return [];
      }

      const friendIds = user.profile.friends.map((friend) => friend.friendId);

      // Fetch friends' details using their IDs
      const friends = await Player.find({ _id: { $in: friendIds } }).select(
        "username profile.status",
      );

      return friends;
    } catch (error) {
      console.error("Error fetching user friends:", error);
      throw new Error("Failed to fetch user friends.");
    }
  }

  async getUserRequests(userId) {
    return await Player.findById(userId)
      .select("profile.sentRequests profile.receivedRequests")
      .exec();
  }

  async getUserCosmetics(userId) {
    return await Player.findById(userId).select("profile.cosmetics").exec();
  }

  async getUserPreferences(userId) {
    return await Player.findById(userId).select("profile").exec();
  }

  async changeHandedness(userId, handedness) {
    if (handedness !== "right" && handedness !== "left") {
      throw new Error('Handedness can only be "right" or "left"');
    }

    const player = await Player.findById(userId);
    player.profile.handedness = handedness;
    await player.save();
    return player;
  }

  async changeGender(userId, gender) {
    if (gender !== "male" && gender !== "female") {
      throw new Error('Gender can only be "male" or "female"');
    }

    const player = await Player.findById(userId);
    player.profile.gender = gender;
    await player.save();
    return player;
  }

  async equipCosmetics(userId, cosmeticIds) {
    const player = await Player.findById(userId);

    if (!player) {
      throw new Error("Player not found");
    }

    for (const cosmeticId of cosmeticIds) {
      const cosmetic = await Cosmetics.findOne({ cosmeticId });

      if (!cosmetic) {
        throw new Error(`Invalid cosmetic ID: ${cosmeticId}`);
      }

      // Equip the new cosmetic based on its type
      switch (cosmetic.type) {
        case "head":
          player.profile.cosmetics.head.cosmeticId = cosmetic.cosmeticId;
          break;
        case "hands":
          player.profile.cosmetics.hands.cosmeticId = cosmetic.cosmeticId;
          break;
        case "dartSkin":
          player.profile.cosmetics.dartSkin.cosmeticId = cosmetic.cosmeticId;
          break;
        case "accessory":
          player.profile.cosmetics.accesory.cosmeticId = cosmetic.cosmeticId;
          break;
        case "face":
          player.profile.cosmetics.face.cosmeticId = cosmetic.cosmeticId;
          break;
        default:
          throw new Error(`Unknown cosmetic type: ${cosmetic.type}`);
      }
    }

    await player.save();
    return player;
  }

  async getAllCosmetics(req, res) {
    try {
      return Cosmetics.find().exec();
    } catch (error) {
      console.error("Error fetching cosmetics:", error);
      throw new Error("Failed to fetch cosmetics.");
    }
  }

  async unlockAchievement(userId, achievement) {
    const validAchievements = [
      "Marksman",
      "Perfectionist",
      "OnaHigh",
      "Hattrick",
      "Unstoppable",
      "Sniper",
      "GlobeTrotter",
      "Headshooter",
      "MustBeDrunk",
      "BringingOuttheMonster",
      "SleepingDeads",
      "TopOfTheWorld",
      "QuiteAComeBack",
      "NoMercy",
      "GrandSalute",
      "FirstBlood",
      "Rampage",
      "TheLegend",
      "GrandSlam",
      "MVP",
      "Dynamite",
      "TeamPlayer",
    ];

    if (!validAchievements.includes(achievement)) {
      console.log(
        `error: the passed value: "${achievement}" is not a valid achievement`,
      );
      throw new Error(
        `error: the passed value: "${achievement}" is not a valid achievement`,
      );
    }

    const player = await Player.findById(userId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check if the achievement is already unlocked
    if (player.achievements[achievement]) {
      throw new Error(`Achievement ${achievement} is already unlocked`);
    }

    // Unlock the achievement
    player.achievements[achievement] = true;
    await player.save();

    return {
      message: `Achievement ${achievement} unlocked for player ${player.username}`,
      achievements: player.achievements,
      success: 200,
    };
  }

  async get501Stats(userId) {
    const player = await Player.findById(userId).select("stats.fiveOhOneStats").exec();
    if (!player) {
      throw new Error("Player not found");
    }
    return {
      stats: player.stats.fiveOhOneStats || {
        single: {
          totalfive0OneGamesPlayed: 0,
          fiveOhOneGamesWon: 0,
          bullseyeHit: 0,
          total180s: 0,
          total180ShotsAttempt: 0,
          total141Checkout: 0,
          totalDoubleShots: 0,
          totalDoubleShotsAttempt: 0,
          total9DartFinish: 0
        },
        multi: {
          totalfive0OneGamesPlayed: 0,
          fiveOhOneGamesWon: 0,
          bullseyeHit: 0,
          total180s: 0,
          total180ShotsAttempt: 0,
          total141Checkout: 0,
          totalDoubleShots: 0,
          totalDoubleShotsAttempt: 0,
          total9DartFinish: 0
        }
      }
    };
  }

  async getZombiesStats(userId) {
    const player = await Player.findById(userId).select("stats.zombiesStats").exec();
    if (!player) {
      throw new Error("Player not found");
    }
    return {
      stats: player.stats.zombiesStats || {
        totalZombiesGamesPlayed: 0,
        highestWave: 0,
        zombiesKilled: 0,
        highestPoints: 0,
        headshots: 0,
        bodyshots: 0,
        legShots: 0
      }
    };
  }

  async getKillstreakStats(userId) {
    const player = await Player.findById(userId).select("stats.killstreakStats").exec();
    if (!player) {
      throw new Error("Player not found");
    }
    return {
      stats: player.stats.killstreakStats || {
        totalKillstreakGamesPlayed: 0,
        totalKillstreakGamesWon: 0,
        highestStreak: 0
      }
    };
  }

  async getATWStats(userId) {
    const player = await Player.findById(userId).select("stats.atwStats").exec();
    if (!player) {
      throw new Error("Player not found");
    }
    return {
      stats: player.stats.atwStats || {
        totalAtwGamesPlayed: 0,
        totalAtwGamesWon: 0,
        leastDartsUsed: 0,
        highestStreak: 0,
        highestPoints: 0
      }
    };
  }
}

module.exports = new PlayerService();
