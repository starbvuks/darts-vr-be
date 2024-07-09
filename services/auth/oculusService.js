// oculusService.js
const axios = require('axios');

const oculusAppToken = process.env.OCULUS_APP_TOKEN;

const validateOculusNonce = async (nonce, oculusId) => {
  try {
    const response = await axios.post('https://graph.oculus.com/user_nonce_validate', {
      nonce,
      access_token: oculusAppToken,
      user_id: oculusId,
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
