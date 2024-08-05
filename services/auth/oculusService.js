const axios = require('axios');

const oculusAppToken = process.env.OCULUS_APP_TOKEN;

exports.validateOculusNonce = async (nonce, oculusId) => {
  try {
    const response = await axios.post('https://graph.oculus.com/user_nonce_validate', {
      nonce,
      access_token: oculusAppToken,
      user_id: oculusId,
    });

    return response.data.is_valid;
  } catch (error) {
    console.error('Error validating Oculus nonce:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`Error validating Oculus nonce: ${error.response.data.error.message} (${error.response.status})`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`Error validating Oculus nonce: No response received (${error.code})`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error validating Oculus nonce: ${error.message}`);
    }
  }
};
