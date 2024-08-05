const axios = require('axios');


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
      throw new Error(data.error.errordesc, 'STEAM_API_ERROR', data.error);
    }

    if (!data.params || !data.params.steamid) {
      throw new Error('Steam ID not found in response', 'INVALID_RESPONSE');
    }

    console.log(data)
    return data.params.steamid;
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Steam API request failed: ${error.response.status}`, 'HTTP_ERROR', error);
      } else if (error.request) {
        throw new Error('No response received from Steam API', 'NETWORK_ERROR', error);
      } else {
        throw new Error('Error setting up Steam API request', 'REQUEST_SETUP_ERROR', error);
      }
    }
    throw new Error('Unexpected error during Steam authentication', 'UNKNOWN_ERROR', error);
  }
};

exports.getPlayerSummaries = async (steamId) => {
  const url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/';
  const params = {
    key: process.env.STEAM_SECRET_KEY,
    steamids: steamId,
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data.response;

    if (!data.players || data.players.length === 0) {
      throw new Error('No player information found', 'INVALID_RESPONSE');
    }

    return data.players[0];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Steam API request failed: ${error.response.status}`, 'HTTP_ERROR', error);
      } else if (error.request) {
        throw new Error('No response received from Steam API', 'NETWORK_ERROR', error);
      } else {
        throw new Error('Error setting up Steam API request', 'REQUEST_SETUP_ERROR', error);
      }
    }
    throw new Error('Unexpected error during Steam player summary retrieval', 'UNKNOWN_ERROR', error);
  }
};
