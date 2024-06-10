const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/?retryWrites=true&w=majority&appName=playground', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User model
const userSchema = new mongoose.Schema({
  steamId: String,
  username: String,
  token: String,
});

const User = mongoose.model('User', userSchema);

// Define the Steam API endpoint for token verification
const steamApiUrl = 'https://api.steampowered.com/ISteamUserAuth/AuthenticateUser/v0001';

// Define the Steam API key
const steamApiKey = '4FEB4A7C7215846689DABEE2FA54E034';

// Define the endpoint to handle Steam login
app.post('/login-steam', async (req, res) => {
  const { token } = req.body;

  // Construct the request to the Steam API
  const steamApiRequest = {
    method: 'POST',
    url: steamApiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      key: steamApiKey,
      token,
    }),
  };

  try {
    // Make the request to the Steam API
    const response = await axios(steamApiRequest);

    // Extract the Steam ID from the response
    const steamId = response.data.response.params.steamid;

    // Verify the Steam ID
    if (steamId) {
      // Check if the user exists in the database
      let user = await User.findOne({ steamId });

      // If the user doesn't exist, create a new one
      if (!user) {
        user = new User({ steamId, username: response.data.response.params.vacbanned === '0' ? response.data.response.params.personaname : 'Anonymous' });
        await user.save();
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

      // Update the user's token in the database
      await User.updateOne({ _id: user._id }, { $set: { token } });

      res.send({ token });
    } else {
      res.status(401).send({ message: 'Invalid Steam token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error logging in with Steam' });
  }
});

// Define the endpoint to handle logout
app.post('/logout', async (req, res) => {
  const { userId } = req.body;

  // Remove the user's token from the database
  await User.updateOne({ _id: userId }, { $set: { token: null } });

  res.send({ message: 'Logged out successfully' });
});

// Define the endpoint to verify the user's token
app.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, 'your-secret-key');

    // Find the user in the database
    const user = await User.findById(decoded.userId);

    if (user && user.token === token) {
      res.send({ userId: user._id, username: user.username });
    } else {
      res.status(401).send({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: 'Invalid token' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});