const { exchangeNpssoForAccessToken, exchangeAccessTokenForRefreshToken, getProfileFromAccessToken } = require('psn-api');

exports.authenticate = async (npsso) => {
    try {
        // Exchange the NPSSO code for an access token
        const accessTokenResponse = await exchangeNpssoForAccessToken(npsso);

        // Optionally exchange access token for refresh token if necessary
        const refreshTokenResponse = await exchangeAccessTokenForRefreshToken(accessTokenResponse.accessToken);

        // Use the access token to fetch the user's profile
        const profile = await getProfileFromAccessToken(accessTokenResponse.accessToken);

        return {
            accessToken: accessTokenResponse.accessToken,
            refreshToken: refreshTokenResponse.refreshToken,
            expiresIn: accessTokenResponse.expiresIn,
            profile,
        };
    } catch (error) {
        console.error('PSN authentication error:', error);
        throw new Error('PSN authentication failed');
    }
};
