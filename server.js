const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");
const { WebSocketServer } = require("ws");
const url = require("url");

const friendsController = require("./controllers/friendsController");
const zombiesController = require("./controllers/gamemodes/zombiesController");
const killstreakController = require("./controllers/gamemodes/killstreakController");

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
  .then(() => console.log("MongoDB connected"))
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
app.post("/api/zombies/invite", (req, res) => {
  zombiesController.inviteFriend(req, res, wss);
});
app.post("/api/killstreak/invite", (req, res) => {
  killstreakController.inviteFriend(req, res, wss);
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
app.post("/api/friends/update-status", (req, res) => {
  friendsController.updatePlayerStatus(req, res, wss);
});



const port = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const urlParams = new url.URL(req.url, "http://localhost:3000");
  const token = urlParams.searchParams.get("token");

  console.log("WebSocket connection received");

  if (!token) {
    console.error("No token provided");
    ws.close(4401, "Unauthorized");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const playerId = decoded.userID;

    ws.userId = playerId;

    // Clean up when the connection is closed
    ws.on("close", () => {
      console.log(`user has disconnected`);
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
    const token = jwt.sign({ userID: user }, process.env.JWT_SECRET_KEY, {
      expiresIn: "4h",
    });
    res.json({ token });
  } else {
    res.status(401).send({ message: "Invalid user ID" });
  }
});

module.exports = app;
