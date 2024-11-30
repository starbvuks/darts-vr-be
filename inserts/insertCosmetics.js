const mongoose = require("mongoose");
const Cosmetics = require("../models/Cosmetics");
const { v4: uuidv4 } = require("uuid");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 20000, // Increase the timeout to 20 seconds
  serverSelectionTimeoutMS: 20000,
});

const cosmeticsData = [
  { name: "Golden Beige", type: "face", unityId: "2" },
  { name: "Tan", type: "face", unityId: "3" },
  { name: "Chestnut", type: "face", unityId: "4" },
  { name: "Ebony", type: "face", unityId: "5" },
  { name: "Onyx", type: "face", unityId: "6" },
];

// const cosmeticsData = [
//   { name: "DefaultFace", type: "face", unityId: "0" },
//   { name: "BlushedFace", type: "face", unityId: "1" },
//   // DartSkins
//   { name: "Australia", type: "dartSkin", unityId: "0" },
//   { name: "Bangladesh", type: "dartSkin", unityId: "1" },
//   { name: "Canada", type: "dartSkin", unityId: "2" },
//   { name: "China", type: "dartSkin", unityId: "3" },
//   { name: "France", type: "dartSkin", unityId: "4" },
//   { name: "Germany", type: "dartSkin", unityId: "5" },
//   { name: "India", type: "dartSkin", unityId: "6" },
//   { name: "Japan", type: "dartSkin", unityId: "7" },
//   { name: "Mexico", type: "dartSkin", unityId: "8" },
//   { name: "NewZealand", type: "dartSkin", unityId: "9" },
//   { name: "Russia", type: "dartSkin", unityId: "10" },
//   { name: "SouthAfrica", type: "dartSkin", unityId: "11" },
//   { name: "SriLanka", type: "dartSkin", unityId: "12" },
//   { name: "UK", type: "dartSkin", unityId: "13" },
//   { name: "USA", type: "dartSkin", unityId: "14" },
//   // Accessories
//   { name: "Eyepatch", type: "accessory", unityId: "0" },
//   { name: "Glasses_1", type: "accessory", unityId: "1" },
//   { name: "Glasses_2", type: "accessory", unityId: "2" },
//   { name: "Glasses_3", type: "accessory", unityId: "3" },
//   { name: "Glasses_4", type: "accessory", unityId: "4" },
//   { name: "Monacle", type: "accessory", unityId: "5" },
//   { name: "ThugLifeGlasses", type: "accessory", unityId: "6" },
//   { name: "Headset", type: "accessory", unityId: "7" },
//   // Hands
//   { name: "DefaultHand", type: "hands", unityId: "0" },
//   { name: "BlackHands", type: "hands", unityId: "1" },
//   { name: "SilverHands", type: "hands", unityId: "2" },
//   { name: "ArmyHands", type: "hands", unityId: "3" },
//   { name: "ZombieHands", type: "hands", unityId: "4" },
//   // Head (formerly Hat)
//   { name: "MaleCowboyHat", type: "head", unityId: "0" },
//   { name: "FemaleCowboyHat", type: "head", unityId: "1" },
//   { name: "MalePartyHat", type: "head", unityId: "2" },
//   { name: "FemalePartyHat", type: "head", unityId: "3" },
//   { name: "MaleMagicianHat", type: "head", unityId: "4" },
//   { name: "FemaleMagicianHat", type: "head", unityId: "5" },
//   { name: "MaleBennie", type: "head", unityId: "6" },
//   { name: "FemaleBennie", type: "head", unityId: "7" },
//   { name: "MaleSantaHat", type: "head", unityId: "8" },
//   { name: "FemaleSantaHat", type: "head", unityId: "9" },
//   { name: "MaleSherrifHat", type: "head", unityId: "10" },
//   { name: "FemaleSherrifHat", type: "head", unityId: "11" },
//   { name: "MalePirateHat", type: "head", unityId: "12" },
//   { name: "FemalePirateHat", type: "head", unityId: "13" },
//   { name: "MaleHairStyle_1", type: "head", unityId: "14" },
//   { name: "MaleHairStyle_2", type: "head", unityId: "15" },
//   { name: "Mohawk", type: "head", unityId: "16" },
//   { name: "FemaleHairStyle_1", type: "head", unityId: "17" },
// ];

async function insertCosmetics() {
  try {
    const cosmeticsToInsert = cosmeticsData.map((cosmetic) => ({
      cosmeticId: uuidv4(),
      name: cosmetic.name,
      unityId: cosmetic.unityId,
      type: cosmetic.type,
      price: cosmetic.price || 0,
    }));

    await Cosmetics.insertMany(cosmeticsToInsert);

    console.log("Cosmetics data inserted successfully!");
  } catch (error) {
    console.error("Error inserting cosmetics data:", error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    insertCosmetics();
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));
