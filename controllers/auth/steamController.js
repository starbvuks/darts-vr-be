const User = require('../../models/Player');
const steamService = require('../../services/auth/steamService');
const authService = require('../../services/auth/authService'); 

exports.steamAuth = async (req, res) => {
  try {
    const { authTicket } = req.body;
    
    if (!authTicket) {
      return res.status(400).json({ error: 'Auth ticket is required' });
    }

    const steamId = await steamService.authenticateUserTicket(authTicket);
    
    let user = await User.findOne({ steamId });
    if (!user) {
      user = new User({ steamId });
      await user.save();
    }

    const tokens = authService.generateTokens(user._id);
    res.json(tokens);

    user.auth.push({
      platform: 'Steam',
      platformId: steamId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: '2h',
    });

    await user.save();

  } catch (error) {
    console.error('Steam auth error:', error);
    res.status(400).json({ error: error.message });
  }
};
