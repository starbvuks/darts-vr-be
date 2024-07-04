const mongoose = require('mongoose');

// Zombies Model
const ZombiesSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  waveReached: { type: Number, required: true },
  headshots: { type: Number, required: true },
  kills: { type: Number, required: true },
  legshots: { type: Number, required: true },
  dartsThrown: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Zombies = mongoose.model('Zombies', ZombiesSchema);

// Around the World (ATW) Model
const ATWSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  leastDartsUsed: { type: Number, required: true },
  leastDartsUsedPlayerName: { type: String, required: true },
  hits: [
    {
      validDartHitNo: { type: Number, required: true },
      dartCount: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const ATW = mongoose.model('ATW', ATWSchema);

// Killstreak Model
const KillstreakSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  highestStreak: { type: Number, required: true },
  minDartsUsed: { type: Number, required: true },
  hits: [
    {
      scoreHit: { type: Number, required: true },
      dartCount: { type: Number, required: true },
      streakCount: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Killstreak = mongoose.model('Killstreak', KillstreakSchema);

// 501 Model
const FiveOhOneSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  bullseyeHit: { type: Number, required: true },
  total180s: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FiveOhOne = mongoose.model('FiveOhOne', FiveOhOneSchema);
