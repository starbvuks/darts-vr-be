const mongoose = require("mongoose");

const DartThrowSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  darts: [
    {
      dart1: { type: Number, default: 0 },
      dart2: { type: Number, default: 0 },
      dart3: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      commentary: { type: String, default: "" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const MatchupSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  round: { type: Number, default: 1 },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  player1Stats: {
    dartsThrown: { type: Number, default: 0 },
    dartsHit: { type: Number, default: 0 },
    bullseyes: { type: Number, default: 0 },
    oneEighties: { type: Number, default: 0 },
    score: { type: Number, default: 501 }, 
    throws: [DartThrowSchema], 
  },
  player2Stats: {
    dartsThrown: { type: Number, default: 0 },
    dartsHit: { type: Number, default: 0 },
    bullseyes: { type: Number, default: 0 },
    oneEighties: { type: Number, default: 0 },
    score: { type: Number, default: 501 }, 
    throws: [DartThrowSchema], 
  },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
  createdAt: { type: Date, default: Date.now },
});

const LeagueSchema = new mongoose.Schema({
  leagueId: { type: String, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }],
  matchups: [MatchupSchema], 
  numPlayers: { type: Number, default: 0 },
  currentRound: { type: Number, default: 1 },
  totalRounds: { type: Number, default: 0 }, 
  status: { type: String, enum: ["open" ,"ongoing", "completed"]},
  createdAt: { type: Date, default: Date.now },
});

const League = mongoose.model("League", LeagueSchema);
const Matchup = mongoose.model("Matchup", MatchupSchema);

module.exports = League;
