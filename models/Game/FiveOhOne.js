const mongoose = require('mongoose');

// 501 Model
const FiveOhOneSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  matchType: {
    type: String,
    enum: ["solo", "multiplayer", "private-2p", "private-3p", "private-4p"],
  },
  status: {
    type: String,
    enum: ["open", "ongoing", "closed"],
  },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player3Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player4Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player1Stats: [
    {
      dart1: {type: Number, min: 0},
      dart2: {type: Number, min: 0},
      dart3: {type: Number, min: 0},
      scoreLeft: {type: Number, min: 0},
      _id: false, 
    },
  ],
  player2Stats: [
    {
      dart1: {type: Number, min: 0},
      dart2: {type: Number, min: 0},
      dart3: {type: Number, min: 0},
      scoreLeft: {type: Number, min: 0},
      _id: false, 
    },
  ],
  player3Stats: [
    {
      dart1: {type: Number, min: 0},
      dart2: {type: Number, min: 0},
      dart3: {type: Number, min: 0},
      scoreLeft: {type: Number, min: 0},
      _id: false, 
    },
  ],
  player4Stats: [
    {
      dart1: {type: Number, min: 0},
      dart2: {type: Number, min: 0},
      dart3: {type: Number, min: 0},
      scoreLeft: {type: Number, min: 0},
      _id: false, 
    },
  ],
  duration: { type: Number, min: 0 }, // in seconds
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FiveOhOne', FiveOhOneSchema);