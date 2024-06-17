const axios = require('axios');

// Function to obtain an access token from Oculus
async function getAccessToken(clientId, clientSecret, redirectUri, code) {
    const url = 'https://www.oculus.com/api/oauth2/v1/access_token/';
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
    });

    try {
        const response = await axios.post(url, params);
        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining Oculus access token:', error);
        throw error;
    }
}

// Simplified session validation - in practice, you'd check the token's validity
async function validateSession(accessToken) {
    // Placeholder for session validation logic
    // In practice, you would check the token's validity against Oculus' API
    return { isValid: true }; // Simulated successful validation
}

module.exports = { getAccessToken, validateSession };
