const mongoose = require("mongoose");

// Around the World (ATW) Model
const ATWSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
  },
  leastDartsUsed: { type: Number, default: 0 },
  dartsThrown: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  highestNumReached: { type: Number, default: 0 },
  victory: Boolean,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ATW", ATWSchema);
