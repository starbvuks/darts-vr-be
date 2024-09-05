const mongoose = require("mongoose");

const PnEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PnEmail", PnEmailSchema, "pn-emails");
