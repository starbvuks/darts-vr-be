const mongoose = require("mongoose");

const DartThrowSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  score: { type: Number, required: true },
  dartsThrown: { type: Number, required: true },
  bullseyes: { type: Number, default: 0 },
  oneEighties: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const MatchupSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  player1Stats: {
    dartsThrown: { type: Number, default: 0 },
    dartsHit: { type: Number, default: 0 },
    bullseyes: { type: Number, default: 0 },
    oneEighties: { type: Number, default: 0 },
    score: { type: Number, default: 501 }, // Starting score for 501
    throws: [DartThrowSchema], // Track each dart thrown by player 1
  },
  player2Stats: {
    dartsThrown: { type: Number, default: 0 },
    dartsHit: { type: Number, default: 0 },
    bullseyes: { type: Number, default: 0 },
    oneEighties: { type: Number, default: 0 },
    score: { type: Number, default: 501 }, // Starting score for 501
    throws: [DartThrowSchema], // Track each dart thrown by player 2
  },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const LeagueSchema = new mongoose.Schema({
  leagueId: { type: String, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }],
  matchups: [MatchupSchema], // Array of matchups in the league
  currentRound: { type: Number, default: 1 },
  totalRounds: { type: Number, required: true }, // Total rounds based on player count
  status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
  createdAt: { type: Date, default: Date.now },
});

const League = mongoose.model("League", LeagueSchema);

module.exports = League;
