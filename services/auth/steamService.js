const axios = require('axios');

class SteamAuthError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'SteamAuthError';
    this.type = type;
    this.originalError = originalError;
  }
}

exports.authenticateUserTicket = async (authTicket) => {
  const url = `https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/`;
  const params = {
    key: process.env.STEAM_SECRET_KEY,
    appid: process.env.STEAM_APP_ID,
    ticket: authTicket
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data.response;

    if (data.error) {
      throw new SteamAuthError(data.error.errordesc, 'STEAM_API_ERROR', data.error);
    }

    if (!data.params || !data.params.steamid) {
      throw new SteamAuthError('Steam ID not found in response', 'INVALID_RESPONSE');
    }

    return data.params.steamid;
  } catch (error) {
    if (error instanceof SteamAuthError) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new SteamAuthError(`Steam API request failed: ${error.response.status}`, 'HTTP_ERROR', error);
      } else if (error.request) {
        throw new SteamAuthError('No response received from Steam API', 'NETWORK_ERROR', error);
      } else {
        throw new SteamAuthError('Error setting up Steam API request', 'REQUEST_SETUP_ERROR', error);
      }
    }
    throw new SteamAuthError('Unexpected error during Steam authentication', 'UNKNOWN_ERROR', error);
  }
};

exports.getUserEmail = async (steamId) => {
  try {
    // In a real scenario, you might want to fetch this from Steam API or your database
    return `user_${steamId}@placeholder.com`;
  } catch (error) {
    throw new SteamAuthError('Failed to get user email', 'EMAIL_RETRIEVAL_ERROR', error);
  }
};
