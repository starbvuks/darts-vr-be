const mongoose = require("mongoose");
const Player = require("../models/Player");
const Cosmetics = require("../models/Cosmetics");

class PlayerService {
  async getUserProfile(userId) {
    return await Player.findById(userId).exec();
  }

  async getUsersProfiles(userIds) {
    return await Player.find({ _id: { $in: userIds } }).exec();
  }

  async getUserStats(userId) {
    return await Player.findById(userId).select("stats").exec();
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
}

module.exports = new PlayerService();
