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
    // const { data } = await axios.get('https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/jwks');
    // const publicKey = data.keys[0].n;

    // console.log(publicKey)

    // // Verify the ID token
    // const decoded = jwt.verify(idToken, publicKey);

    const decoded = jwt.verify(idToken, "2Z5Aa0nfaW6yftqHL_jTwxm0k_eED_dnU9ewqaao_5CjJAvpj-p7ojWZyeJeflNgsuXa4W-__VMUuC6MavvtGprAXgRuHNF7lSNwWygVOuZgEXL2rcn7zlh-O5ZmgDPkWFatTy0kL3ZM8ePP8t5q7say7fFzb17Zhv5vNLMF3aNw76oE20L9k5Ie6wqIuQeYu1jqz1vvR3kY0eLc1b4AxvPcEpnDVi8j29kCivf_xIyFSdcxPuY4Mvey1AHMSyUp6SRKwfmq1gZ1p-aV7gfOG6muCk7P1Tef16V8ypxIVo0YfspalmEYk4D8676fh95RDrDYAm_4uOQPS0hqQl4k8MPnE4Okh0cWuAVgxu50DbVLIxYzEkVM48WJ3Ztm2EWwkq8Ww0oF5bHSWoUNmRsT5bJvdbmCqCCwZwUulntHLsmCajQpVcGFTiLnjH7VadsnZa80KcXwxjryJSg0S8lXwKvWYMNXq7MplNCrp1iJXkImuWHK1urImlRAYk9nTPdz");
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