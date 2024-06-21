const Player = require('../../models/Player');
const steamService = require('../../services/auth/steamService');
const authService = require('../../services/auth/authService'); 

exports.steamAuth = async (req, res) => {
  try {
    const { authTicket } = req.body;
    
    if (!authTicket) {
      return res.status(400).json({ error: 'Auth ticket is required' });
    }

    const steamId = await steamService.authenticateUserTicket(authTicket);
    
    let player = await Player.findOne({ 'auth.platformId': steamId });
    if (!player) {
      player = new Player({
        auth: [
          {
            platform: 'Steam',
            platformId: steamId,
          },
        ],
      });
      await player.save();
    }

    const { accessToken, refreshToken } = await authService.generateTokens(player._id);

    player.auth.push({
      platform: 'Steam',
      platformId: steamId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: '2h', 
    });

    await player.save();
    res.json({ accessToken, refreshToken });

  } catch (error) {
    console.error('Steam auth error:', error);
    res.status(400).json({ error: error.message });
  }
};
