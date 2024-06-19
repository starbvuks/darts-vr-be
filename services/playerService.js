const mongoose = require('mongoose');
const Player = require('../models/Player');

class PlayerService {
  async getUserProfile(userId) {
    return await Player.findById(userId).exec();
  }

  async getUserStats(userId) {
    return await Player.findById(userId).select('stats').exec();
  }

  async getUserFriends(userId) {
    return await Player.findById(userId).select('friends').exec();
  }

  async getUserRequests(userId) {
    return await Player.findById(userId).select('sentRequests receivedRequests').exec();
  }

  async getUserCosmetics(userId) {
    return await Player.findById(userId).select('cosmetics').exec();
  }

  async getUserPreferences(userId) {
    return await Player.findById(userId).select('profile').exec();
  }
}

module.exports = new PlayerService();
