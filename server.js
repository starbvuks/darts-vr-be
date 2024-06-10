const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: 'darts_vr_secret_key',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

const jwtSecretKey = 'darts_vr_secret_key';

// Replace these with your Steam API key and return URL
const steamApiKey = '4FEB4A7C7215846689DABEE2FA54E034';
const returnURL = 'http://localhost:3000/auth/steam/callback';
const realm = 'http://localhost:3000/';

// Passport configuration
passport.use(new SteamStrategy({
  returnURL: returnURL,
  realm: realm,
  apiKey: steamApiKey
}, async (identifier, profile, done) => {
  try {
    // Extract the Steam ID from the profile
    const steamId = profile.id;

    // Fetch additional user information from Steam
    const response = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`);
    const player = response.data.response.players[0];

    // Attach the additional information to the profile
    profile.personaname = player.personaname;
    profile.avatar = player.avatarfull;

    return done(null, profile);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/auth/steam', passport.authenticate('steam', { session: false }));

app.get('/auth/steam/callback', passport.authenticate('steam', { failureRedirect: '/', session: false }), (req, res) => {
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
app.get('/user', authenticateJWT, (req, res) => {
  try {
    // Fetch the user's information based on the decoded JWT token
    const userProfile = req.user.profile;
    res.send(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching user information' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
