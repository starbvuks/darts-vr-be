const mongoose = require('mongoose');

// Zombies Model
const ZombiesSchema = new mongoose.Schema({
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  matchType: {
    type: String,
    enum: ["solo", "multiplayer"],
    required: true,
  },
  player1Stats: {
    waveReached: { type: Number, required: true, min: 0 },
    headshots: { type: Number, required: true, min: 0 },
    kills: { type: Number, required: true, min: 0 },
    legshots: { type: Number, required: true, min: 0 },
    dartsThrown: { type: Number, required: true, min: 0 },
    score: { type: Number, required: true, min: 0 },
  },
  player2Stats: {
    waveReached: { type: Number, min: 0 },
    headshots: { type: Number, min: 0 },
    kills: { type: Number, min: 0 },
    legshots: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    score: { type: Number, min: 0 },
  },
  duration: { type: Number, required: true, min: 0 }, // in seconds
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Zombies', ZombiesSchema);


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

// 501 Model
const FiveOhOneSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  bullseyeHit: { type: Number, required: true },
  total180s: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FiveOhOne = mongoose.model('FiveOhOne', FiveOhOneSchema);