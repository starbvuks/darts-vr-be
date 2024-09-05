const mongoose = require("mongoose");

const PnEmailSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true },
  firstName: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PnEmail", PnEmailSchema, "pn-emails");
