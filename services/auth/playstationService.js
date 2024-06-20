const { exchangeNpssoForAccessToken, exchangeAccessTokenForRefreshToken, getProfileFromAccessToken } = require('psn-api');

exports.authenticate = async (npsso) => {
    try {
        const accessTokenResponse = await exchangeNpssoForAccessToken(npsso);

        const refreshTokenResponse = await exchangeAccessTokenForRefreshToken(accessTokenResponse.accessToken);

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
