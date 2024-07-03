const authService = require('../../services/auth/playstationService');

exports.authenticateUser = async (req, res) => {
  try {
    const { idToken } = req.body;
    const { user, sessionToken } = await authService.authenticateUser(idToken);
    res.json({ user, sessionToken });
  } catch (error) {
    console.error('Error authenticating PlayStation user:', error);
    if (error instanceof PlayStationAuthError) {
      res.status(400).json({ error: error.message, type: error.type });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
