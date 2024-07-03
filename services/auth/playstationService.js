const axios = require('axios');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

class PlayStationAuthError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'PlayStationAuthError';
    this.type = type;
    this.originalError = originalError;
  }
}

exports.authenticateUser = async (idToken) => {
  try {
    // Verify the ID token using the public key obtained from GetJwks Auth Web API
    const decoded = await verifyIDToken(idToken);

    // Extract user information from the verified ID token
    const { online_id, age, device_type } = decoded;

    // Connect to MongoDB
    const mongoClient = new MongoClient('mongodb://localhost:27017');
    await mongoClient.connect();
    const db = mongoClient.db('your_database');
    const users = db.collection('users');

    // Check if the user exists
    let user = await users.findOne({ online_id });

    // If the user exists, generate a session token or JWT
    if (user) {
      const sessionToken = jwt.sign({ userId: user._id }, 'your_secret_key');
      return { user, sessionToken };
    }

    // If the user doesn't exist, create a new user document
    const newUser = { online_id, age, device_type };
    const result = await users.insertOne(newUser);
    const sessionToken = jwt.sign({ userId: result.insertedId }, 'your_secret_key');
    return { user: newUser, sessionToken };
  } catch (error) {
    console.error('Error authenticating PlayStation user:', error);
    throw new PlayStationAuthError('Error authenticating PlayStation user', 'AUTHENTICATION_ERROR', error);
  }
};

async function verifyIDToken(idToken) {
  try {
    // Obtain the public key from the GetJwks Auth Web API
    const { data } = await axios.get('https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/jwks');
    const publicKey = data.keys[0].n;

    // Verify the ID token
    const decoded = jwt.verify(idToken, publicKey);

    // Validate the ID token
    if (decoded.env_iss_id !== 'current_environment') {
      throw new Error('Invalid environment');
    }

    return decoded;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new PlayStationAuthError('Error verifying ID token', 'TOKEN_VERIFICATION_ERROR', error);
  }
}
