const mongoose = require('mongoose');

// Killstreak Model
const KillstreakSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  matchType: {
    type: String,
    enum: ["solo", "multiplayer"],
    required: true,
  },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player'},
  roundsPlayed: [
    {
      roundNumber: { type: Number, min: 0 },
      winner: {
        type: String,
        enum: ["player1", "player2", "tie"],
      },
    },
  ],
  player1Stats: [
    {
      currentStreak: { type: Number, required: true, min: 0 },
      bestStreak: { type: Number, required: true, min: 0 },
      totalPoints: { type: Number, required: true, min: 0 },
      totalDarts: { type: Number, required: true, min: 0 },
    },
  ],
  player2Stats: [
    {
      currentStreak: { type: Number, min: 0 },
      bestStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
    },
  ],
  winner: {
    type: String,
    enum: ["player1", "player2"],
  },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Killstreak', KillstreakSchema);