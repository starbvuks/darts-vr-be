const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
    tournamentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    openTime: { type: Date, required: true },
    closeTime: { type: Date, required: true },
    openDuration: { type: Number, required: true }, 
    sets: { type: Number, required: true },
    legs: { type: Number, required: true },
    status: { type: String, enum: ['scheduled', 'open', 'completed'], default: 'scheduled' },
})

const Tournament = mongoose.model("Tournament", TournamentSchema);

module.exports = Tournament;