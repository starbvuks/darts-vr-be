const mongoose = require("mongoose");

// 501 Model
const FiveOhOneSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  matchType: {
    type: String,
    enum: ["solo", "multiplayer", "private"],
  },
  status: {
    type: String,
    enum: ["open", "ongoing", "closed"],
  },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player3Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player4Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player1Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    _id: false,
  },
  player2Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    _id: false,
  },

  player3Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    _id: false,
  },

  player4Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    _id: false,
  },

  duration: { type: Number, min: 0 }, // in seconds
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FiveOhOne", FiveOhOneSchema);
