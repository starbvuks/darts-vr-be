const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');

// Initialize express
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

// MongoDB connection
const mongoUri = 'mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Import and use Steam authentication routes
const steamAuth = require('./routes/auth/steamAuth');
app.use(steamAuth);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
