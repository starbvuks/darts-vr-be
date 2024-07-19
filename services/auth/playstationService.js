const axios = require('axios');
const jwt = require('jsonwebtoken');

class PlayStationAuthError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'PlayStationAuthError';
    this.type = type;
    this.originalError = originalError;
  }
}

exports.validatePSNSession = async (idToken) => {
  try {
    // Verify the ID token using the public key obtained from GetJwks Auth Web API
    const decoded = await verifyIDToken(idToken);

    // Extract user information from the verified ID token
    const { online_id, age, device_type } = decoded;

    return { online_id, age, device_type };
  } catch (error) {
    console.error('Error validating PlayStation session:', error);
    if (error instanceof PlayStationAuthError) {
      throw error;
    } else {
      throw new PlayStationAuthError('Error validating PlayStation session', 'VALIDATION_ERROR', error);
    }
  }
};

// exports.validatePSNSession = async (idToken) => {
//   try {
//     // Verify the ID token using the public key obtained from GetJwks Auth Web API
//     const decoded = await verifyIDToken(idToken);

//     // Extract user information from the verified ID token
//     const { online_id, age, device_type } = decoded;

//     return { online_id, age, device_type };
//   } catch (error) {
//     console.error('Error validating PlayStation session:', error);
//     if (error instanceof PlayStationAuthError) {
//       throw error;
//     } else {
//       throw new PlayStationAuthError('Error validating PlayStation session', 'VALIDATION_ERROR', error);
//     }
//   }
// };

async function verifyIDToken(idToken) {
  try {
    // Obtain the public key from the GetJwks Auth Web API
    const { data } = await axios.get('https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/jwks');
    const publicKey = data.keys[0].n;

    console.log(publicKey)

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