const express = require("express");
const friendRequestRoutes = require("./controllers/friendsController");

const app = express();

app.use(express.json());
app.use("/api/friends", friendRequestRoutes);

