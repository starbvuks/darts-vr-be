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
      currentStreak: { type: Number, min: 0 },
      bestStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
      _id: false, 
    },
  ],
  player2Stats: [
    {
      currentStreak: { type: Number, min: 0 },
      bestStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
      _id: false, 
    },
  ],
  player3Stats: [
    {
      currentStreak: { type: Number, min: 0 },
      bestStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
      _id: false, 
    },
  ],
  player4Stats: [
    {
      currentStreak: { type: Number, min: 0 },
      bestStreak: { type: Number, min: 0 },
      totalPoints: { type: Number, min: 0 },
      totalDarts: { type: Number, min: 0 },
      _id: false, 
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

const FiveOhOne = mongoose.model('FiveOhOne', FiveOhOneSchema);