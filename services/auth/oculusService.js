// oculusService.js
const axios = require('axios');

const oculusAppId = process.env.OCULUS_APP_ID;
const oculusAppSecret = process.env.OCULUS_APP_SECRET;

const validateOculusNonce = async (nonce, oculusId) => {
  try {
    const response = await axios.post('https://graph.oculus.com/user_nonce_validate', {
      nonce,
      access_token: oculusAppSecret,
      APP_ID: oculusAppId,
      APP_SECRET: oculusAppSecret
    });

    return response.data.is_valid;
  } catch (error) {
    console.error('Error validating Oculus nonce:', error);
    throw error;
  }
};

module.exports = {
  validateOculusNonce
};
