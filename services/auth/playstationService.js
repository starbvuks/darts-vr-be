const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

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
    const decoded = await verifyJWT(idToken);

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

function getKeyFromJWKs(jwks, kid) {
  return jwks.find(jwk => jwk.kid === kid);
}

async function verifyJWT(token) {
  const {data} = await axios.get('https://s2s.sp-int.playstation.net/api/authz/v3/oauth/jwks');
  const decodedHeader = verifyIDToken(token, { complete: true });

  
  if (!decodedHeader) {
    throw new Error('Invalid token');
  }
  
  const { kid } = decodedHeader.header;
  const jwk = getKeyFromJWKs(data.keys, kid);
  
  if (!jwk) {
    throw new Error('JWK not found');
  }
  
  const pem = jwkToPem(jwk);
  return new Promise((resolve, reject) => {
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      console.log(decoded)
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    })
  });
}

async function verifyIDToken(idToken) {
  try {
    // Obtain the public key from the GetJwks Auth Web API
    const { data } = await axios.get('https://s2s.sp-int.playstation.net/api/authz/v3/oauth/jwks');
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