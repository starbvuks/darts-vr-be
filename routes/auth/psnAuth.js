const passport = require('passport');
const SonyStrategy = require('passport-sony').Strategy;

passport.use(new SonyStrategy({
  clientID: 'your_client_id',
  clientSecret: 'your_client_secret',
  callbackURL: 'http://localhost:3000/auth/psn/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Handle the PSN profile
    const psnId = profile.id;
    const player = await Player.findOne({ psnId });
    if (!player) {
      // Create new player
      player = new Player({
        psnId: psnId,
        displayName: profile.displayName,
        avatar: profile.photos[2].value // Use appropriate index for full-size avatar
      });
      await player.save();
    }

    return done(null, player);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((player, done) => {
  done(null, player._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const player = await Player.findById(id);
    done(null, player);
  } catch (error) {
    done(error);
  }
});