const mongoose = require("mongoose");

// Killstreak Model
const KillstreakSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  matchType: {
    type: String,
    enum: ["solo", "multiplayer", "private-2p"],
  },
  status: {
    type: String,
    enum: ["open", "ongoing", "closed"],
  },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  roundsPlayed: [
    {
      winner: {
        type: String,
        enum: ["player1", "player2"],
        _id: false, 
      },
      _id: false, 
    },
  ],
  player1Stats: [
    {
      currentStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
      _id: false, 
    },
  ],
  player2Stats: [
    {
      currentStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
      _id: false, 
    },
  ],
  duration: { type: Number, min: 0 }, // in seconds
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Killstreak", KillstreakSchema);
