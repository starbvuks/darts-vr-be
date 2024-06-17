// backend/src/controllers/auth/oculusController.js

const https = require('https');
const User = require('../../models/Player.js');

exports.validateOculusSession = async (req, res) => {
  try {
    const { nonce, userId } = req.body;

    // Validate the Oculus session
    const oculusUser = await validateOculusSession(userId, nonce);

    // Check if the user exists in the database
    let user = await User.findOne({ oculusId: userId });

    if (!user) {
      // Create a new user if not found
      user = new User({ oculusId: userId });
      await user.save();
    }

    // Generate an access token for the user
    const accessToken = generateAccessToken(user);

    res.json({ user, accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

function validateOculusSession(userId, nonce) {
  const options = {
    method: 'POST',
    hostname: 'graph.oculus.com',
    path: '/user_nonce_validate',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error('Invalid Oculus session'));
        }
      });
    });

    req.write(`access_token=OC|${oculus.clientId}|${oculus.clientSecret}&nonce=${nonce}&user_id=${userId}`);
    req.end();
  });
}

function generateAccessToken(user) {
  // Generate and return an access token for the user
  // ...
}