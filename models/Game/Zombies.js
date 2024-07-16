const mongoose = require("mongoose");

const ZombiesSchema = new mongoose.Schema({
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  matchId: String,
  matchType: {
    type: String,
    enum: ["solo", "multiplayer"],
  },
  status: {
    type: String,
    enum: ["open", "closed"],
  },
  player1Stats: {
    waveReached: { type: Number, min: 0 },
    headshots: { type: Number, min: 0 },
    kills: { type: Number, min: 0 },
    legshots: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    score: { type: Number, min: 0 },
  },
  player2Stats: {
    waveReached: { type: Number, min: 0 },
    headshots: { type: Number, min: 0 },
    kills: { type: Number, min: 0 },
    legshots: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    score: { type: Number, min: 0 },
  },
  duration: { type: Number, min: 0 }, // in seconds
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Zombies", ZombiesSchema);
