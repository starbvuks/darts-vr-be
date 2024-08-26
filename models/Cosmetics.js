const mongoose = require("mongoose");

const cosmeticsSchema = new mongoose.Schema({
  name: String,
  unityId: String,
  price: Number,
  cosmeticId: String,
  type: {
    type: String,
    enum: ["head", "hands", "dartSkin", "accessory", "face"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cosmetics", cosmeticsSchema);
