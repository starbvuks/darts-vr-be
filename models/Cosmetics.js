const mongoose = require("mongoose");

const cosmeticsSchema = new mongoose.Schema({
  name: String,
  cosmeticId: String,
  price: Number,
  type: {
    type: String,
    enum: ["hat", "gloves", "dart", "glasses"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cosmetics", cosmeticsSchema);
