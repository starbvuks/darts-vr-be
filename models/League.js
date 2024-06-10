const mongoose = require("mongoose");

const leagueSchema = new mongoose.Schema({
  name: String,
  description: String,
  legs: Number,
  sets: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  matchups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matchup",
    },
  ],
  rounds: Number,
  currentRound: Number,
  status: {
    type: String,
    enum: ["Scheduled", "Ongoing", "Completed"],
    default: "Scheduled",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("League", leagueSchema);
