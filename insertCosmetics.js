const mongoose = require("mongoose");
const Cosmetics = require("./models/Cosmetics");
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function insertDemoCosmetics() {
  try {
    await client.connect();
    const db = client.db("DARTS");
    const collection = db.collection("cosmetics");

    const demoCosmetics = [
      {
        name: "Red Baseball Cap",
        price: 0,
        type: "hat"
      },
      {
        name: "Black Leather Gloves",
        price: 0,
        type: "gloves"
      },
      {
        name: "Neon Green Dart Skin",
        price: 0,
        type: "dart"
      },
      {
        name: "Flaming Dart Skin",
        price: 0,
        type: "dart"
      },
      {
        name: "Blue Beanie",
        price: 0,
        type: "hat"
      }
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