const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");
const { WebSocketServer } = require("ws");
const url = require("url");

const PnEmail = require("./models/PnEmail");

const friendsController = require("./controllers/friendsController");
const zombiesController = require("./controllers/gamemodes/zombiesController");
const killstreakController = require("./controllers/gamemodes/killstreakController");
const fiveOhOneController = require("./controllers/gamemodes/fiveOhOneController");
const leagueController = require("./controllers/leagueController");
const tournamentController = require("./controllers/tournament/tournamentController");

const { startCronJobs } = require("./cronJobs");

require("dotenv").config();

// Initialize express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoUri =
  "mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground";
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    startCronJobs();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const steamAuth = require("./routes/auth/steamRoutes");
app.use("/api/auth", steamAuth);

const psnAuth = require("./routes/auth/playstationRoutes");
app.use("/api/auth", psnAuth);

const oculusAuth = require("./routes/auth/oculusRoutes");
app.use("/api/auth", oculusAuth);

const playerInfo = require("./routes/playerRoutes.js");
app.use("/", playerInfo);

// gamemodes
const gamemodes = require("./routes/gamemodes/gamemodeRoutes.js");
app.use("/", gamemodes);

// tournament
const leaderboard = require("./routes/leaderboardRoutes.js");
app.use("/api", leaderboard);

app.post("/api/zombies", (req, res) => {
  zombiesController.joinOrCreateMatch(req, res, wss);
});
app.post("/api/zombies/rematch", (req, res) => {
  zombiesController.createRematch(req, res, wss);
});
app.post("/api/zombies/invite", (req, res) => {
  zombiesController.inviteFriend(req, res, wss);
});

app.post("/api/killstreak", (req, res) => {
  killstreakController.joinOrCreateMatch(req, res, wss);
});
app.post("/api/killstreak/rematch", (req, res) => {
  killstreakController.createRematch(req, res, wss);
});
app.post("/api/killstreak/invite", (req, res) => {
  killstreakController.inviteFriend(req, res, wss);
});

app.post("/api/501", (req, res) => {
  fiveOhOneController.joinOrCreateMatch(req, res, wss);
});
app.post("/api/501/rematch", (req, res) => {
  fiveOhOneController.createRematch(req, res, wss);
});
app.post("/api/501/invite", (req, res) => {
  fiveOhOneController.inviteFriend(req, res, wss);
});

// league
const league = require("./routes/leagueRoutes.js");
app.use("/", league);

app.post("/api/league/invite", (req, res) => {
  leagueController.invitePlayer(req, res, wss);
});
app.post("/api/league/start", (req, res) => {
  leagueController.startLeague(req, res, wss);
});
app.post("/api/league/end-match", (req, res) => {
  leagueController.endMatch(req, res, wss);
});
app.post("/api/league/end-league", (req, res) => {
  leagueController.endLeague(req, res, wss);
});
app.post("/api/league/update-stats", (req, res) => {
  leagueController.dartThrow(req, res, wss);
});

// tournaments
const tourney = require("./routes/tournament/tournamentRoutes.js");
app.use("/", tourney);

app.post("/api/tournament/create", (req, res) => {
  tournamentController.createTournament(req, res, wss);
});
app.post("/api/tournament", (req, res) => {
  tournamentController.joinTournament(req, res, wss);
});

// friend requests
app.post("/api/friends/send-request", (req, res) => {
  friendsController.sendFriendRequest(req, res, wss);
});
app.post("/api/friends/unsend-request", (req, res) => {
  friendsController.unsendFriendRequest(req, res, wss);
});
app.post("/api/friends/accept-request", (req, res) => {
  friendsController.acceptFriendRequest(req, res, wss);
});
app.post("/api/friends/decline-request", (req, res) => {
  friendsController.declineFriendRequest(req, res, wss);
});
app.post("/api/friends/remove-request", (req, res) => {
  friendsController.removeFriend(req, res, wss);
});
app.post("/api/friends/block-player", (req, res) => {
  friendsController.blockPlayer(req, res, wss);
});
app.post("/api/friends/unblock-player", (req, res) => {
  friendsController.unblockPlayer(req, res, wss);
});
app.post("/api/friends/search", (req, res) => {
  friendsController.searchFriends(req, res, wss);
});
app.post("/api/friends/notify-lobby", (req, res) => {
  friendsController.notifyLobbyCreated(req, res, wss);
});

const port = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const urlParams = new url.URL(req.url, "http://localhost:3000");
  const token = urlParams.searchParams.get("token");

  console.log("WebSocket connection received");
  console.log('Currently connected user IDs:', 
    [...wss.clients].map(c => c.userId)
  );

  if (!token) {
    console.error("No token provided");
    ws.close(4401, "Unauthorized");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const playerId = decoded.userId;

    ws.userId = playerId;

    friendsController.updatePlayerStatus(playerId, "online", wss);

    // Clean up when the connection is closed
    ws.on("close", () => {
      console.log(`user has disconnected`);
      friendsController.updatePlayerStatus(playerId, "offline", wss);
    });
  } catch (err) {
    console.error("Error verifying token:", err);
    ws.close();
  }
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.post("/demo-login", (req, res) => {
  const { user } = req.body;

  // Validate the provided user ID
  if (user == "6666d32dead7f3bab9218bf8") {
    const token = jwt.sign({ userId: user }, process.env.JWT_SECRET_KEY, {
      expiresIn: "6h",
    });
    res.json({ token });
  } else {
    res.status(401).send({ message: "Invalid user ID" });
  }
});

app.post("/pn-email", async (req, res) => {
  const { email, firstName } = req.body;

  try {
    const newEmailEntry = new PnEmail({ email, firstName });

    await newEmailEntry.save();

    return res
      .status(201)
      .json({ success: true, message: "Email added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }
    console.error("Error adding email:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = app;
