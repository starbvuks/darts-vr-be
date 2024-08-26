const mongoose = require("mongoose");
const Player = require("../models/Player");
const Cosmetics = require("../models/Cosmetics");

class PlayerService {
  async getUserProfile(userId) {
    return await Player.findById(userId).exec();
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
      const cosmetic = await Cosmetics.findById(cosmeticId);

      if (!cosmetic) {
        throw new Error(`Invalid cosmetic ID: ${cosmeticId}`);
      }

      // Equip the new cosmetic based on its type
      switch (cosmetic.type) {
        case "hat":
          player.profile.cosmetics.hat.hatId = cosmetic._id;
          player.profile.cosmetics.hat.hatName = cosmetic.name;
          break;
        case "hands":
          player.profile.cosmetics.hands.handsId = cosmetic._id;
          player.profile.cosmetics.hands.handsName = cosmetic.name;
          break;
        case "dartSkin":
          player.profile.cosmetics.dartSkin.dartSkinId = cosmetic._id;
          player.profile.cosmetics.dartSkin.dartSkinName = cosmetic.name;
          break;
        case "accessories":
          player.profile.cosmetics.glasses.glassesId = cosmetic._id;
          player.profile.cosmetics.glasses.glassesName = cosmetic.name;
          break;
        case "face":
          player.profile.cosmetics.gender.genderId = cosmetic._id;
          player.profile.cosmetics.gender.genderName = cosmetic.name;
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
      throw new Error("Invalid achievement name");
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
    };
  }
}

module.exports = new PlayerService();
