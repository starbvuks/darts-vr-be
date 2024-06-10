const { MongoClient } = require('mongodb');

async function main() {
    const uri = 'mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/?retryWrites=true&w=majority&appName=playground'; // Update this with your MongoDB connection string
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('DARTS');
        const collection = database.collection('Player');

        const players = [
            {
                username: "player1",
                email: "player1@example.com",
                passwordHash: "hashedpassword1",
                auth: {
                    platform: "PSN",
                    platformId: "psn_id_1",
                    accessToken: "access_token_1",
                    refreshToken: "refresh_token_1",
                    expiresIn: 3600
                },
                profile: {
                    platformType: "PS5",
                    country: "USA",
                    avatar: "avatar_url_1",
                    preferences: {
                        sound: true,
                        notifications: true,
                        language: "English"
                    },
                    onlineStatus: "offline",
                    lastLogin: new Date(),
                    handedness: "right",
                    friends: [],
                    recentlyPlayedWith: [],
                    cosmetics: {
                        costumes: [],
                        dartSkins: []
                    }
                },
                stats: {
                    totalDartsThrown: 500,
                    total180s: 10,
                    totalBullseyes: 20,
                    totalWins: 30,
                    totalLosses: 20,
                    totalMatchesPlayed: 50,
                    totalDNFs: 5,
                    accuracy: 75,
                    leagueStats: {
                        totalLeagueDartsThrown: 300,
                        totalLeague180s: 8,
                        totalLeagueBullseyes: 15,
                        totalLeagueWins: 18,
                        totalLeagueLosses: 12,
                        totalLeagueMatchesPlayed: 30,
                        totalLeagueDNFs: 3,
                        leagueAccuracy: 78
                    }
                },
                gamesPlayed: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: "player2",
                email: "player2@example.com",
                passwordHash: "hashedpassword2",
                auth: {
                    platform: "Steam",
                    platformId: "steam_id_2",
                    accessToken: "access_token_2",
                    refreshToken: "refresh_token_2",
                    expiresIn: 3600
                },
                profile: {
                    platformType: "PC",
                    country: "UK",
                    avatar: "avatar_url_2",
                    preferences: {
                        sound: true,
                        notifications: false,
                        language: "English"
                    },
                    onlineStatus: "online",
                    lastLogin: new Date(),
                    handedness: "left",
                    friends: [],
                    recentlyPlayedWith: [],
                    cosmetics: {
                        costumes: [],
                        dartSkins: []
                    }
                },
                stats: {
                    totalDartsThrown: 700,
                    total180s: 20,
                    totalBullseyes: 25,
                    totalWins: 35,
                    totalLosses: 15,
                    totalMatchesPlayed: 50,
                    totalDNFs: 3,
                    accuracy: 80,
                    leagueStats: {
                        totalLeagueDartsThrown: 400,
                        totalLeague180s: 12,
                        totalLeagueBullseyes: 18,
                        totalLeagueWins: 22,
                        totalLeagueLosses: 8,
                        totalLeagueMatchesPlayed: 30,
                        totalLeagueDNFs: 2,
                        leagueAccuracy: 83
                    }
                },
                gamesPlayed: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: "player3",
                email: "player3@example.com",
                passwordHash: "hashedpassword3",
                auth: {
                    platform: "Meta",
                    platformId: "meta_id_3",
                    accessToken: "access_token_3",
                    refreshToken: "refresh_token_3",
                    expiresIn: 3600
                },
                profile: {
                    platformType: "Meta Quest",
                    country: "Canada",
                    avatar: "avatar_url_3",
                    preferences: {
                        sound: true,
                        notifications: true,
                        language: "French"
                    },
                    onlineStatus: "offline",
                    lastLogin: new Date(),
                    handedness: "right",
                    friends: [],
                    recentlyPlayedWith: [],
                    cosmetics: {
                        costumes: [],
                        dartSkins: []
                    }
                },
                stats: {
                    totalDartsThrown: 600,
                    total180s: 15,
                    totalBullseyes: 22,
                    totalWins: 28,
                    totalLosses: 22,
                    totalMatchesPlayed: 50,
                    totalDNFs: 4,
                    accuracy: 77,
                    leagueStats: {
                        totalLeagueDartsThrown: 350,
                        totalLeague180s: 10,
                        totalLeagueBullseyes: 17,
                        totalLeagueWins: 20,
                        totalLeagueLosses: 10,
                        totalLeagueMatchesPlayed: 30,
                        totalLeagueDNFs: 2,
                        leagueAccuracy: 80
                    }
                },
                gamesPlayed: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = await collection.insertMany(players);
        console.log(`${result.insertedCount} players were inserted`);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
