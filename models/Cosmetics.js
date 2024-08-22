const mongoose = require("mongoose");

const cosmeticsSchema = new mongoose.Schema({
  name: String,
  unityId: String,
  price: Number,
  type: {
    type: String,
    enum: ["hat", "hands", "dartSkin", "glasses", "gender"],
    // change glasses -> accessories
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cosmetics", cosmeticsSchema);
