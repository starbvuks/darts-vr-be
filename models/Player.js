const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    Marksman: { type: Boolean, default: false }, // Bullseye 10 times
    Perfectionist: { type: Boolean, default: false }, // Complete a game of 501 with 9 darts
    OnaHigh: { type: Boolean, default: false }, // Achieve a total of 180 points in a single game
    Hattrick: { type: Boolean, default: false }, // Hit three bullseye in a row
    Unstoppable: { type: Boolean, default: false }, // 1-10 in Around the world without failing
    Sniper: { type: Boolean, default: false }, // Killstreak hitting til 10x
    GlobeTrotter: { type: Boolean, default: false }, // Chose 5 different country flags
    Headshooter: { type: Boolean, default: false }, // 100 zombie headshots
    MustBeDrunk: { type: Boolean, default: false }, // Missed all three dart hits for the first time.
    BringingOuttheMonster: { type: Boolean, default: false }, // Hits 5 audience in party mode
    SleepingDeads: { type: Boolean, default: false }, // Headshots to all types of Zombies in one game
    TopOfTheWorld: { type: Boolean, default: false }, // League victory
    QuiteAComeBack: { type: Boolean, default: false }, // Win a game after being more than 200 points behind
    NoMercy: { type: Boolean, default: false }, // Win 5 matches of 501 in multiplayer without losing any
    GrandSalute: { type: Boolean, default: false }, // Finishing ATW in one single turn
    FirstBlood: { type: Boolean, default: false }, // Win your first game of Kill Streak
    Rampage: { type: Boolean, default: false }, // Achieve a killstreak of 15
    TheLegend: { type: Boolean, default: false }, // Finish 25 waves of zombies in solo
    GrandSlam: { type: Boolean, default: false }, // Win one multiplayer game of each mode
    MVP: { type: Boolean, default: false }, // Win 100 leagues
    Dynamite: { type: Boolean, default: false }, // Kill 50 zombies with explosive dart in one game
    TeamPlayer: { type: Boolean, default: false }, // Survive 15 waves of zombies in multiplayer
  },
  { _id: false },
);

const playerSchema = new mongoose.Schema({
  username: String,
  email: String,
  auth: [
    {
      platform: String,
      platformId: String,
      _id: false,
    },
  ],
  profile: {
    country: String,
    handedness: String,
    status: {
      type: String,
      enum: ["offline", "online", "in-game"],
    },
    banned: { type: Boolean, default: false },
    timeouts: {
      timedOut: { type: Boolean, default: false },
      numberOfTimeouts: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
    },
    blocked: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        username: String,
        since: Date,
      },
    ],
    friends: [
      {
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        since: Date,
      },
    ],
    sentRequests: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        timestamp: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "denied"],
          default: "pending",
        },
      },
    ],
    receivedRequests: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        timestamp: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "denied"],
          default: "pending",
        },
      },
    ],
    recentlyPlayedWith: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        username: String,
        lastPlayedDate: Date,
      },
    ],
    cosmetics: {
      head: {
        cosmeticId: String,
      },
      hands: {
        cosmeticId: String,
      },
      dartSkin: {
        cosmeticId: String,
      },
      accesory: {
        cosmeticId: String,
      },
      face: {
        cosmeticId: String,
      },
    },
  },
  stats: {
    totalDartsThrown: { type: Number, default: 0 },
    totalDartsHit: { type: Number, default: 0 },
    total180s: { type: Number, default: 0 },
    totalBullseyes: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalMatchesPlayed: { type: Number, default: 0 },
    totalDNFs: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    leagueStats: {
      totalLeagueDartsThrown: { type: Number, default: 0 },
      totalLeagueDartsHit: { type: Number, default: 0 },
      totalLeague180s: { type: Number, default: 0 },
      totalLeagueBullseyes: { type: Number, default: 0 },
      totalLeagueWins: { type: Number, default: 0 },
      totalLeagueMatchesPlayed: { type: Number, default: 0 },
      totalLeagueDNFs: { type: Number, default: 0 },
      leagueAccuracy: { type: Number, default: 0 },
    },
    atwStats: {
      totalAtwGamesPlayed: { type: Number, default: 0 },
      totalAtwGamesWon: { type: Number, default: 0 },
      leastDartsUsed: { type: Number, default: 0 },
      highestStreak: { type: Number, default: 0 },
      highestPoints: { type: Number, default: 0 },
    },
    zombiesStats: {
      totalZombiesGamesPlayed: { type: Number, default: 0 },
      highestWave: { type: Number, default: 0 },
      zombiesKilled: { type: Number, default: 0 },
      highestPoints: { type: Number, default: 0 },
      headshots: { type: Number, default: 0 },
      bodyshots: { type: Number, default: 0 },
      legShots: { type: Number, default: 0 },
    },
    fiveOhOneStats: {
      totalfive0OneGamesPlayed: { type: Number, default: 0 },
      fiveOhOneGamesWon: { type: Number, default: 0 },
      bullseyeHit: { type: Number, default: 0 },
      total180s: { type: Number, default: 0 },
    },
    killstreakStats: {
      totalKillstreakGamesPlayed: { type: Number, default: 0 },
      totalKillstreakGamesWon: { type: Number, default: 0 },
      highestStreak: { type: Number, default: 0 },
    },
  },
  achievements: {
    type: achievementSchema,
    default: () => ({}),
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: Boolean,
});

module.exports = mongoose.model("Player", playerSchema);
