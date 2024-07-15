const mongoose = require('mongoose');

// 501 Model
const FiveOhOneSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  bullseyeHit: { type: Number, required: true },
  total180s: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FiveOhOne = mongoose.model('FiveOhOne', FiveOhOneSchema);