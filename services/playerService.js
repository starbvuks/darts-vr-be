const mongoose = require('mongoose');
const Player = require('../models/Player');
const Cosmetics = require('../models/Cosmetics');

class PlayerService {
  async getUserProfile(userId) {
    return await Player.findById(userId).exec();
  }

  async getUserStats(userId) {
    return await Player.findById(userId).select('stats').exec();
  }

  async getUserFriends(userId) {
    return await Player.findById(userId).select('profile.friends').exec();
  }

  async getUserRequests(userId) {
    return await Player.findById(userId).select('profile.sentRequests profile.receivedRequests').exec();
  }

  async getUserCosmetics(userId) {
    return await Player.findById(userId).select('profile.cosmetics').exec();
  }

  async getUserPreferences(userId) {
    return await Player.findById(userId).select('profile').exec();
  }

  async changeHandedness(userId, handedness) {
    if (handedness !== 'right' && handedness !== 'left') {
      throw new Error('Handedness can only be "right" or "left"');
    }

    const player = await Player.findById(userId);
    player.profile.handedness = handedness;
    await player.save();
    return player;
  }

  async changeGender(userId, gender) {
    if (gender !== 'male' && gender !== 'female') {
      throw new Error('Gender can only be "male" or "female"');
    }

    const player = await Player.findById(userId);
    player.profile.gender = gender;
    await player.save();
    return player;
  }

  async equipCosmetic(userId, cosmeticId) {
    const player = await Player.findById(userId);
    const cosmetic = await Cosmetics.findById(cosmeticId);

    if (!cosmetic) {
      throw new Error('Invalid cosmetic ID');
    }

    // Equip the new cosmetic
    switch (cosmetic.type) {
      case 'hat':
        player.profile.cosmetics.hat.hatId = cosmetic._id;
        player.profile.cosmetics.hat.hatName = cosmetic.name;
        break;
      case 'gloves':
        player.profile.cosmetics.gloves.glovesId = cosmetic._id;
        player.profile.cosmetics.gloves.gloveName = cosmetic.name;
        break;
      case 'dart':
        player.profile.cosmetics.dartSkin.dartSkinId = cosmetic._id;
        player.profile.cosmetics.dartSkin.dartSkinName = cosmetic.name;
        break;
    }

    await player.save();
    return player;
  }
}


module.exports = new PlayerService();
