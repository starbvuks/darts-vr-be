const mongoose = require("mongoose");

const LeagueSchema = new mongoose.Schema({
  leagueId: { type: String, required: true, unique: true },
  players: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  ],
  matchups: [
    {
      matchId: { type: String, required: true, unique: true },
      prevMatchIds: [],
      round: { type: Number, default: 1 },
      player1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      player2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      player1Stats: {
        dartsThrown: { type: Number, default: 0 },
        dartsHit: { type: Number, default: 0 },
        bullseyes: { type: Number, default: 0 },
        oneEighties: { type: Number, default: 0 },
        score: { type: Number, default: 501 },
        setsWon: { type: Number, default: 0 },
        legsWon: { type: Number, default: 0 },
        throws: [
          {
            dart1: { type: Number, default: 0 },
            dart2: { type: Number, default: 0 },
            dart3: { type: Number, default: 0 },
            score: { type: Number, default: 0 },
            commentary: { type: String, default: "" },
            _id: false,
          },
        ],
      },
      player2Stats: {
        dartsThrown: { type: Number, default: 0 },
        dartsHit: { type: Number, default: 0 },
        bullseyes: { type: Number, default: 0 },
        oneEighties: { type: Number, default: 0 },
        score: { type: Number, default: 501 },
        setsWon: { type: Number, default: 0 },
        legsWon: { type: Number, default: 0 },
        throws: [
          {
            dart1: { type: Number, default: 0 },
            dart2: { type: Number, default: 0 },
            dart3: { type: Number, default: 0 },
            score: { type: Number, default: 0 },
            commentary: { type: String, default: "" },
            _id: false,
          },
        ],
      },
      winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        default: null,
      },
      status: {
        type: String,
        enum: ["ongoing", "completed"],
        default: "ongoing",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  numPlayers: { type: Number, default: 0 },
  currentRound: { type: Number, default: 1 },
  matchesPerRound: [],
  sets: { type: Number, default: 0 },
  legs: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 0 },
  status: { type: String, enum: ["open", "ongoing", "completed"] },
  createdAt: { type: Date, default: Date.now },
});

const League = mongoose.model("League", LeagueSchema);

module.exports = League;
