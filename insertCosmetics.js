const mongoose = require("mongoose");
const Cosmetics = require("./models/Cosmetics");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function insertDemoCosmetics() {
  try {
    await client.connect();
    const db = client.db("DARTS");
    const collection = db.collection("cosmetics");

    const demoCosmetics = [
      {
        name: "Default Hat",
        unityId: 0,
        price: 0,
        type: "hat",
      },
      {
        name: "Default Hands",
        unityId: 0,
        price: 0,
        type: "hands",
      },
      {
        name: "Default Dart Skin",
        unityId: 0,
        price: 0,
        type: "dartSkin",
      },
      {
        name: "Default Glasses",
        unityId: 0,
        price: 0,
        type: "glasses",
      },
      {
        name: "Male",
        unityId: 0,
        price: 0,
        type: "gender",
      },
    ];

    await collection.insertMany(demoCosmetics);
    console.log("Demo cosmetics inserted successfully!");
  } catch (error) {
    console.error("Error inserting demo cosmetics:", error);
  } finally {
    await client.close();
  }
}

insertDemoCosmetics();
