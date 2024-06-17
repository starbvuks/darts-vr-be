const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a user.
 * 
 * @param {Object} payload - The payload to encode in the token.
 * @param {string} secretKey - The secret key used to sign the token.
 * @param {number} expiresIn - The duration (in seconds) for which the token is valid.
 * @returns {string} The generated JWT token.
 */
function generateToken(payload, secretKey, expiresIn) {
  return jwt.sign(payload, secretKey, { expiresIn });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * 
 * @param {string} token - The JWT token to verify.
 * @param {string} secretKey - The secret key used to sign the token.
 * @returns {Object} The decoded payload of the token, or throws an error if the token is invalid.
 */
function verifyToken(token, secretKey) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Formats the response for token refresh or issuance.
 * 
 * @param {Object} tokens - An object containing the new access token and optional refresh token.
 * @returns {Object} Formatted response object.
 */
function formatResponse(tokens) {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken || null,
    expiresIn: tokens.expiresIn,
  };
}

module.exports = {
  generateToken,
  verifyToken,
  formatResponse,
};
