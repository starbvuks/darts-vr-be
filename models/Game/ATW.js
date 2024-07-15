const mongoose = require("mongoose");

// Around the World (ATW) Model
const ATWSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    leastDartsUsed: { type: Number, required: true },
    points: { type: Number, required: true },
    highestNumReached: { type: Number, required: true },
    victory: Boolean,
    hits: [
      {
        validDartHitNo: { type: Number, required: true },
        dartCount: { type: Number, required: true }
      }
    ],
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('ATW', ATWSchema);