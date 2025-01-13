const mongoose = require("mongoose");

// 501 Model
const FiveOhOneSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  gamemode: { type: String, default: "501" },
  matchType: {
    type: String,
    enum: ["solo", "multiplayer", "private"],
  },
  status: {
    type: String,
    enum: ["open", "ongoing", "closed"],
  },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player3Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  player4Id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },

  player1Username: {
    type: String,
    default: null,
  },
  player2Username: {
    type: String,
    default: null,
  },
  player3Username: {
    type: String,
    default: null,
  },
  player4Username: {
    type: String,
    default: null,
  },

  player1Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    total180ShotsAttempt: { type: Number, default: 0, min: 0 },
    total141Checkout: { type: Number, default: 0, min: 0 },
    totalDoubleShots: { type: Number, default: 0, min: 0 },
    totalDoubleShotsAttempt: { type: Number, default: 0, min: 0 },
    total9DartFinish: { type: Number, default: 0, min: 0 },
    lastTurn: {
      dart1: { type: Number, min: 0 },
      dart2: { type: Number, min: 0 },
      dart3: { type: Number, min: 0 },
      _id: false,
    },
    _id: false,
  },

  player2Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    total180ShotsAttempt: { type: Number, default: 0, min: 0 },
    total141Checkout: { type: Number, default: 0, min: 0 },
    totalDoubleShots: { type: Number, default: 0, min: 0 },
    totalDoubleShotsAttempt: { type: Number, default: 0, min: 0 },
    total9DartFinish: { type: Number, default: 0, min: 0 },
    lastTurn: {
      dart1: { type: Number, min: 0 },
      dart2: { type: Number, min: 0 },
      dart3: { type: Number, min: 0 },
      _id: false,
    },
    _id: false,
  },

  player3Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    total180ShotsAttempt: { type: Number, default: 0, min: 0 },
    total141Checkout: { type: Number, default: 0, min: 0 },
    totalDoubleShots: { type: Number, default: 0, min: 0 },
    totalDoubleShotsAttempt: { type: Number, default: 0, min: 0 },
    total9DartFinish: { type: Number, default: 0, min: 0 },
    lastTurn: {
      dart1: { type: Number, min: 0 },
      dart2: { type: Number, min: 0 },
      dart3: { type: Number, min: 0 },
      _id: false,
    },
    _id: false,
  },

  player4Stats: {
    bullseyes: { type: Number, min: 0 },
    oneEighties: { type: Number, min: 0 },
    scoreLeft: { type: Number, min: 0 },
    dartsThrown: { type: Number, min: 0 },
    dartsHit: { type: Number, min: 0 },
    total180ShotsAttempt: { type: Number, default: 0, min: 0 },
    total141Checkout: { type: Number, default: 0, min: 0 },
    totalDoubleShots: { type: Number, default: 0, min: 0 },
    totalDoubleShotsAttempt: { type: Number, default: 0, min: 0 },
    total9DartFinish: { type: Number, default: 0, min: 0 },
    lastTurn: {
      dart1: { type: Number, min: 0 },
      dart2: { type: Number, min: 0 },
      dart3: { type: Number, min: 0 },
      _id: false,
    },
    _id: false,
  },

  duration: { type: Number, min: 0 }, // in seconds
  numPlayers: { type: Number, min: 1 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FiveOhOne", FiveOhOneSchema);
