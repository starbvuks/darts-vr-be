const { MongoClient } = require('mongodb');

async function updatePlayerById() {
  const uri = 'mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    const db = client.db("DARTS");
    const collection = db.collection("players");

    // Import ObjectId from the mongodb package
    const ObjectId = require('mongodb').ObjectId;

    // Correctly converting the hexadecimal string to an ObjectId
    const playerId = new ObjectId("6666d32dead7f3bab9218bf8");

    // Dummy data for the update
    const updateData = {
      username: "sshyster",
      email: "sshyster@example.com",
      auth: {
        platform: "Steam",
        platformId: "1234567890abcdef",
        accessToken: "dummyAccessToken",
        refreshToken: "dummyRefreshToken",
        expiresIn: 3600
      },
      profile: {
        platformType: "Steam",
        country: "US",
        handedness: "Right",
        gender: "Male",
        timeouts: {
          numberOfTimeouts: 0,
          banned: false,
          duration: 0
        },
        friends: [],
        sentRequests: [],
        receivedRequests: [],
        recentlyPlayedWith: [],
        cosmetics: {
          hats: [],
          gloves: [],
          dartSkins: []
        }
      },
      stats: {
        totalDartsThrown: 100,
        totalDartsHit: 80,
        totalDartsAirtime: 1200,
        total180s: 20,
        totalBullseyes: 5,
        totalWins: 15,
        totalLosses: 5,
        totalMatchesPlayed: 20,
        totalDNFs: 2,
        accuracy: 80,
        leagueStats: {
          totalLeagueDartsThrown: 50,
          totalLeagueDartsHit: 40,
          totalLeague180s: 10,
          totalLeagueBullseyes: 3,
          totalLeagueWins: 8,
          totalLeagueLosses: 2,
          totalLeagueMatchesPlayed: 10,
          totalLeagueDNFs: 1,
          leagueAccuracy: 80
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update the document by _id
    const result = await collection.updateOne(
        { "_id": playerId },
        { $set: updateData }
      );
  
      console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s).`);
    } finally {
      await client.close();
    }
  }
  
  updatePlayerById().catch(console.error);
