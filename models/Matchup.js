const mongoose = require('mongoose');

const matchupSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League'
  },
  roundNumber: Number,
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  rounds: [{
    roundNumber: Number,
    sets: [{
      setNumber: Number,
      legs: [{
        legNumber: Number,
        turns: [{
          player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          },
          darts: [{
            throwNumber: Number,
            score: Number,
            isBullseye: Boolean,
            isTriple20: Boolean
          }],
          score: Number,
          commentatorRemark: String
        }],
        winner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player'
        },
        score: Number
      }],
      winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      score: Number
    }],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    score: Number
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  datePlayed: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Matchup', matchupSchema);
