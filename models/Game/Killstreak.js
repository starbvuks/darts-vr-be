const mongoose = require("mongoose");

const KillstreakRoundSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  streak: { type: Number, required: true },
  chosenNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  _id: false
});

// Killstreak Model
const KillstreakSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  gamemode: { type: String, default: "Killstreak" },  
  matchType: {
    type: String,
    enum: ["solo", "private-2p"],
    required: true
  },
  status: {
    type: String,
    enum: ["open", "ongoing", "closed"],
  },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player1Stats: {
    rounds: [KillstreakRoundSchema],
    totalDartsThrown: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    _id: false
  },
  player2Stats: {
    rounds: [KillstreakRoundSchema],
    totalDartsThrown: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    _id: false
  },
  duration: { type: Number, min: 0 }, // in seconds
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  numPlayers: { type: Number, min: 1, max: 2 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Killstreak", KillstreakSchema);
