const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS";

async function updatePlayers() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db("DARTS");
    const collection = db.collection("players");

    // Define the default achievements structure
    const defaultAchievements = {
      Marksman: false,
      Perfectionist: false,
      OnaHigh: false,
      Hattrick: false,
      Unstoppable: false,
      Sniper: false,
      GlobeTrotter: false,
      Headshooter: false,
      MustBeDrunk: false,
      BringingOuttheMonster: false,
      SleepingDeads: false,
      TopOfTheWorld: false,
      QuiteAComeBack: false,
      NoMercy: false,
      GrandSalute: false,
      FirstBlood: false,
      Rampage: false,
      TheLegend: false,
      GrandSlam: false,
      MVP: false,
      Dynamite: false,
      TeamPlayer: false,
    };

    // Update all players who do not have the achievements field
    const result = await collection.updateMany(
      { achievements: { $exists: false } },
      { $set: { achievements: defaultAchievements } },
    );

    console.log(`${result.matchedCount} players matched the query criteria.`);
    console.log(
      `${result.modifiedCount} players were updated with the achievements field.`,
    );
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

updatePlayers();
