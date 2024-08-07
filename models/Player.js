const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: String,
  email: String,
  auth: [
    {
      platform: String,
      platformId: String,
      _id: false,
    },
  ],
  profile: {
    country: String,
    handedness: String,
    status: {
      type: String,
      enum: ["offline", "online", "in-game"],
    },
    banned: { type: Boolean, default: false },
    timeouts: {
      timedOut: { type: Boolean, default: false },
      numberOfTimeouts: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
    },
    blocked: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        username: String,
        since: Date,
      },
    ],
    friends: [
      {
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        username: String,
        status: {
          type: String,
          enum: ["offline", "online", "in-game"],
          default: "offline",
        },
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
  },
  stats: {
    totalDartsThrown: { type: Number, default: 0 },
    totalDartsHit: { type: Number, default: 0 },
    total180s: { type: Number, default: 0 },
    totalBullseyes: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalMatchesPlayed: { type: Number, default: 0 },
    totalDNFs: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    leagueStats: {
      totalLeagueDartsThrown: { type: Number, default: 0 },
      totalLeagueDartsHit: { type: Number, default: 0 },
      totalLeague180s: { type: Number, default: 0 },
      totalLeagueBullseyes: { type: Number, default: 0 },
      totalLeagueWins: { type: Number, default: 0 },
      totalLeagueMatchesPlayed: { type: Number, default: 0 },
      totalLeagueDNFs: { type: Number, default: 0 },
      leagueAccuracy: { type: Number, default: 0 },
    },
    atwStats: {
      totalAtwGamesPlayed: { type: Number, default: 0 },
      totalAtwGamesWon: { type: Number, default: 0 },
      leastDartsUsed: { type: Number, default: 0 },
      highestStreak: { type: Number, default: 0 },
      highestPoints: { type: Number, default: 0 },
    },
    zombiesStats: {
      totalZombiesGamesPlayed: { type: Number, default: 0 },
      highestWave: { type: Number, default: 0 },
      zombiesKilled: { type: Number, default: 0 },
      highestPoints: { type: Number, default: 0 },
      headshots: { type: Number, default: 0 },
      bodyshots: { type: Number, default: 0 },
      legShots: { type: Number, default: 0 },
    },
    fiveOhOneStats: {
      totalfive0OneGamesPlayed: { type: Number, default: 0 },
      fiveOhOneGamesWon: { type: Number, default: 0 },
      bullseyeHit: { type: Number, default: 0 },
      total180s: { type: Number, default: 0 },
    },
    killstreakStats: {
      totalKillstreakGamesPlayed: { type: Number, default: 0 },
      totalKillstreakGamesWon: { type: Number, default: 0 },
      highestStreak: { type: Number, default: 0 },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: Boolean,
});

module.exports = mongoose.model("Player", playerSchema);
