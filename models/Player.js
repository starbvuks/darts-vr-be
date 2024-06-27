const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: String,
  email: String,
  auth: [
    {
      platform: String, 
      platformId: String, 
    },
  ],
  profile: {
    country: String,
    handedness: String,
    banned: { type: Boolean, default: false },
    timeouts: {
      timedOut: { type: Boolean, default: false },
      numberOfTimeouts: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
    },
    blocked: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        since: Date,
      },
    ],
    friends: [
      {
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        username: String,
        since: Date,
      },
    ],
    sentRequests: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        timestamp: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "denied"],
          default: "pending",
        },
      },
    ],
    receivedRequests: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        timestamp: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "denied"],
          default: "pending",
        },
      },
    ],
    recentlyPlayedWith: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        username: String,
        lastPlayedDate: Date,
      },
    ],
    cosmetics: {
      hat: {
        hatId: mongoose.Schema.Types.ObjectId, 
      },
      hands: {
        handsId: mongoose.Schema.Types.ObjectId, 
      },
      dartSkin: {
        dartSkinId: mongoose.Schema.Types.ObjectId, 
      },
      glasses: {
        glassesId: mongoose.Schema.Types.ObjectId, 
      },
      gender: {
        genderId: mongoose.Schema.Types.ObjectId, 
      },
    },
    socketIds: [String], 
  },
  stats: {
    totalDartsThrown: Number,
    totalDartsHit: Number,
    totalDartsAirtime: Number,
    total180s: Number,
    totalBullseyes: Number,
    totalWins: Number,
    totalLosses: Number,
    totalMatchesPlayed: Number,
    totalDNFs: Number,
    accuracy: Number,
    leagueStats: {
      totalLeagueDartsThrown: Number,
      totalLeagueDartsHit: Number,
      totalLeague180s: Number,
      totalLeagueBullseyes: Number,
      totalLeagueWins: Number,
      totalLeagueLosses: Number,
      totalLeagueMatchesPlayed: Number,
      totalLeagueDNFs: Number,
      leagueAccuracy: Number,
    },
    atwStats: {
      totalAtwGamesPlayed: Number,
      highestStreak: Number,
      highestPoints: Number,
    },
    zombiesStats: {
      totalZombiesGamesPlayed: Number,
      highestWave: Number,
      zombiesKilled: Number,
      highestPoints: Number,
      headshots: Number,
      legShots: Number,
    },
    five0OneStats: {
      totalfive0OneGamesPlayed: Number,
    },
    killstreakStats: {
      totalKillstreakGamesPlayed: Number,
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: Boolean,
});

module.exports = mongoose.model("Player", playerSchema);
