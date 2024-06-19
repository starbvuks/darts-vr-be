const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
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

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.post('/demo-login', (req, res) => {
  const { user } = req.body;

  // Validate the provided user ID
  if (user == "6666d32dead7f3bab9218bf8") {
    const token = jwt.sign({ userID: user }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send({ message: 'Invalid user ID' });
  }
});

module.exports = app;

// http://localhost:3000/api/users/?userId=6666d32dead7f3bab9218bf8
