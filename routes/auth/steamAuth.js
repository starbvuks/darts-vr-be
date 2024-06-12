const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const router = express.Router();

const steamApiKey = '4FEB4A7C7215846689DABEE2FA54E034';
const returnURL = 'http://localhost:3000/auth/steam/callback';
const realm = 'http://localhost:3000/';
const jwtSecretKey = 'darts_vr_secret_key';

// Define Player Schema
const PlayerSchema = new mongoose.Schema({
  steamId: String,
  email: String,
  displayName: String,
  avatar: String,
});
const Player = mongoose.model('Player', PlayerSchema);

passport.use(new SteamStrategy({
  returnURL: 'http://localhost:3000/auth/steam/return',
  realm: 'http://localhost:3000/',
  apiKey: 'your steam API key'
}, async (identifier, profile, done) => {
  const steamId = profile.id;
  const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`;
  http.get(apiUrl, async (res) => {
    const playerData = JSON.parse(res.body).response.players[0];
    const email = playerData.email;
    // Create new player
    const player = new Player({
      steamId: steamId,
      email: email,
      displayName: profile.displayName,
      avatar: profile.photos[2].value
    });
    await player.save();
    return done(null, player);
  });
}));

passport.serializeUser((player, done) => {
  done(null, player._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const player = await Player.findById(id);
    done(null, player);
  } catch (error) {
    done(error);
  }
});

router.get('/auth/steam', passport.authenticate('steam', { session: false }));

router.get('/auth/steam/callback', passport.authenticate('steam', { failureRedirect: '/', session: false }), (req, res) => {
  // Redirect to the front-end with the entire user profile data in the JWT token
  const authToken = jwt.sign({ profile: req.user }, jwtSecretKey, { expiresIn: '1h' });
  res.redirect(`http://localhost:3001/?token=${authToken}`);
});

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Define the endpoint to fetch user information
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    // Fetch the user's information based on the decoded JWT token
    const steamId = req.user.profile.steamId;
    const player = await Player.findOne({ steamId });

    if (!player) {
      return res.status(404).send({ message: 'User not found' });
    }

    const userInfo = {
      steamId: player.steamId,
      email: player.email,
      displayName: player.displayName,
      avatar: player.avatar,
    };

    res.send(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching user information' });
  }
});

module.exports = router;