const { MongoClient, ObjectId } = require("mongodb");

// MongoDB URI
const uri =
  "mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground";

// Create MongoDB Client
const client = new MongoClient(uri);

async function deleteUserMatches(userId) {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Select database & collection
    const database = client.db("DARTS");
    const matchesCollection = database.collection("fiveohones"); // Ensure correct collection name

    // Convert userId to ObjectId (Only if it's a valid ObjectId format)
    let playerObjectId;
    if (ObjectId.isValid(userId)) {
      playerObjectId = new ObjectId(userId);
    } else {
      console.error("❌ Invalid ObjectId format:", userId);
      return;
    }

    // Define query to find matches where the user appears as a player
    const query = {
      $or: [
        { player1Id: playerObjectId },
        { player2Id: playerObjectId },
        { player3Id: playerObjectId },
        { player4Id: playerObjectId },
      ],
    };

    // Fetch matches before deleting (for logging)
    const matchesToDelete = await matchesCollection.find(query).toArray();
    console.log(`🔍 Found ${matchesToDelete.length} matches to delete.`);

    if (matchesToDelete.length === 0) {
      console.log("✅ No matches found for this player.");
      return;
    }

    // Delete the matches
    const deleteResult = await matchesCollection.deleteMany(query);
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} matches.`);

  } catch (error) {
    console.error("❌ Error deleting matches:", error);
  } finally {
    // Close the database connection
    await client.close();
    console.log("🔒 MongoDB connection closed.");
  }
}

// Run the function with the given user ID
deleteUserMatches("669f85360b6a7eddb20ed0c7");
