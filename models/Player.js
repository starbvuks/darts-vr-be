const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  _id: ObjectId,
  username: String,
  email: String,
  auth: [{
    platform: String, // e.g., 'Steam', 'Oculus', 'PlayStation'
    platformId: String, // Unique identifier for the platform (e.g., Steam ID)
    accessToken: String,
    refreshToken: String,
    expiresIn: Number,
  }],
  profile: {
    country: String,
    handedness: String,
    gender: String,
    timeouts: {
      numberOfTimeouts: { type: Number, default: 0 },
      banned: { type: Boolean, default: false },
      duration: { type: Number, default: 0 },
    },
    friends: [
      {
        friendId: mongoose.Schema.Types.ObjectId,
        username: String,
        since: Date,
      },
    ],
    sentRequests: [
      {
        friendId: mongoose.Schema.Types.ObjectId,
        username: String,
        timestamp: Date,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'denied'],
          default: 'pending'
        }
      },
    ],
    receivedRequests: [
      {
        friendId: mongoose.Schema.Types.ObjectId,
        username: String,
        timestamp: Date,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'denied'],
          default: 'pending'
        }
      },
    ],
    recentlyPlayedWith: [
      {
        playerId: mongoose.Schema.Types.ObjectId,
        username: String,
        lastPlayedDate: Date,
      },
    ],
    cosmetics: {
      hats: [
        {
          hatId: mongoose.Schema.Types.ObjectId,
          hatName: String,
          hatEquipped: Boolean,
        },
      ],
      gloves: [
        {
          glovesId: mongoose.Schema.Types.ObjectId,
          gloveName: String,
          gloveEquipped: Boolean,
        },
      ],
      dartSkins: [
        {
          dartSkinId: mongoose.Schema.Types.ObjectId,
          dartSkinName: String,
          dartSkinEquipped: Boolean,
        },
      ],
    },
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
      totalAtwGamesPlayed: Number
    },
    zombiesStats: {
      totalGamesPlayed: Number
    },
    atwStats: {
      totalZombiesGamesPlayed: Number
    },
    killstreakStats: {
      totalKillstreakGamesPlayed: Number
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: Boolean
});

module.exports = mongoose.model("Player", playerSchema);
