const mongoose = require('mongoose');
const Player = require('./models/Player.js');

const uri =
  "mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground";

async function deletePlayerData() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const playerIds = ['6666d32dead7f3bab9218bf8', '6673d54ca1af8512fb61c979'];

    for (const playerId of playerIds) {
      const player = await Player.findById(playerId);
      if (player) {
        // Delete all sent requests
        player.profile.sentRequests = [];
        // Delete all received requests  
        player.profile.receivedRequests = [];
        // Delete all friends
        player.profile.friends = [];
        await player.save();
        console.log(`Player data deleted for player with ID: ${playerId}`);
      } else {
        console.log(`Player with ID ${playerId} not found.`);
      }
    }

    await mongoose.disconnect();
    console.log('Player data deleted successfully.');
  } catch (error) {
    console.error('Error deleting player data:', error);
  }
}

deletePlayerData();
